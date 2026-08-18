const express = require('express');
const { requireUser } = require('../middleware/auth');
const { resolvePizzaSelection } = require('../utils/pricing');

const router = express.Router();

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

router.post('/create-order', requireUser, async (req, res) => {
  try {
    const { total } = await resolvePizzaSelection(req.body);
    const amountInPaise = Math.round(total * 100);

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.json({ simulated: true, amount: total, currency: 'INR' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `pizza_${Date.now()}`,
    });

    res.json({
      simulated: false,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Erreur lors de la creation du paiement.' });
  }
});

module.exports = router;
