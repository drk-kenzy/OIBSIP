const express = require('express');
const crypto = require('crypto');

const Order = require('../models/Order');
const Ingredient = require('../models/Ingredient');
const { requireUser, requireAdmin } = require('../middleware/auth');
const { resolvePizzaSelection } = require('../utils/pricing');
const { checkLowStock } = require('../cron/stockCheck');
const { sendMail } = require('../config/mailer');

const router = express.Router();

const STATUS_FLOW = ['recue', 'en_cuisine', 'en_livraison', 'livree'];

function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return expected === razorpaySignature;
}

router.post('/', requireUser, async (req, res) => {
  const { baseId, sauceId, cheeseId, veggieIds, razorpayOrderId, razorpayPaymentId, razorpaySignature, simulated } = req.body;

  let selection;
  try {
    selection = await resolvePizzaSelection({ baseId, sauceId, cheeseId, veggieIds });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Selection invalide.' });
  }

  let paymentId = null;
  if (simulated) {
    paymentId = `simulated_${Date.now()}`;
  } else {
    const validSignature = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!validSignature) {
      return res.status(400).json({ error: 'Signature de paiement invalide.' });
    }
    paymentId = razorpayPaymentId;
  }

  const { base, sauce, cheese, veggies, total } = selection;
  const allIngredientIds = [base._id, sauce._id, cheese._id, ...veggies.map(v => v._id)];

  // Deduction atomique du stock ; on revalide stock >= 1 dans la requete elle-meme
  // pour eviter une vente en double en cas de requetes concurrentes.
  const deductions = await Promise.all(
    allIngredientIds.map(id => Ingredient.findOneAndUpdate({ _id: id, stock: { $gte: 1 } }, { $inc: { stock: -1 } }, { new: true }))
  );
  if (deductions.some(d => !d)) {
    // Rollback des deductions qui ont reussi si une seule a echoue
    await Promise.all(
      deductions.map((d, i) => (d ? Ingredient.updateOne({ _id: allIngredientIds[i] }, { $inc: { stock: 1 } }) : null))
    );
    return res.status(409).json({ error: 'Stock insuffisant pour finaliser la commande.' });
  }

  const order = await Order.create({
    user: req.userId,
    pizza: {
      base: { ingredient: base._id, name: base.name },
      sauce: { ingredient: sauce._id, name: sauce.name },
      cheese: { ingredient: cheese._id, name: cheese.name },
      veggies: veggies.map(v => ({ ingredient: v._id, name: v.name })),
    },
    total,
    status: 'recue',
    paymentStatus: 'payee',
    paymentId,
    razorpayOrderId: razorpayOrderId || null,
  });

  const io = req.app.get('io');
  io.to('admin:orders').emit('order:new', { orderId: order._id });

  checkLowStock().catch(err => console.error('Erreur verification stock post-commande:', err));

  res.status(201).json({ order });
});

router.get('/mine', requireUser, async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ orders });
});

router.get('/:id', requireUser, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  res.json({ order });
});

// ---------- Admin ----------

router.get('/', requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
  res.json({ orders });
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!STATUS_FLOW.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  const existing = await Order.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Commande introuvable.' });
  const wasAlreadyDelivered = existing.status === 'livree';

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email');
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });

  const io = req.app.get('io');
  io.to(`order:${order._id}`).emit('order:status', { orderId: order._id, status: order.status });
  io.to(`user:${order.user._id}`).emit('order:status', { orderId: order._id, status: order.status });

  if (status === 'livree' && !wasAlreadyDelivered && order.user?.email) {
    const itemsHtml = [order.pizza.base.name, order.pizza.sauce.name, order.pizza.cheese.name, ...order.pizza.veggies.map(v => v.name)]
      .map(name => `<li>${name}</li>`).join('');
    sendMail({
      to: order.user.email,
      subject: 'Ta pizza est arrivée !',
      html: `<p>Bonjour ${order.user.name},</p><p>Ta commande #${order._id.toString().slice(-6).toUpperCase()} vient d'être livrée. Bon appétit !</p><ul>${itemsHtml}</ul><p>Total payé : ${order.total} €</p>`,
    }).catch(err => console.error('Erreur envoi email de livraison:', err));
  }

  res.json({ order });
});

module.exports = router;
