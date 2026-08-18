const cron = require('node-cron');
const Ingredient = require('../models/Ingredient');
const Admin = require('../models/Admin');
const { sendMail } = require('../config/mailer');

const RENOTIFY_AFTER_MS = 1000 * 60 * 60 * 12; // ne pas spammer : au plus 1 alerte / ingredient / 12h

async function checkLowStock() {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 5;
  const now = new Date();

  const lowStockItems = await Ingredient.find({ stock: { $lte: threshold } });
  const toNotify = lowStockItems.filter(item => {
    if (!item.lowStockNotifiedAt) return true;
    return now - item.lowStockNotifiedAt > RENOTIFY_AFTER_MS;
  });

  if (toNotify.length === 0) return { checked: lowStockItems.length, notified: 0 };

  const admins = await Admin.find().select('username');
  const adminEmails = admins.length ? null : null; // les admins n'ont pas d'email dedie dans ce modele simplifie

  const listHtml = toNotify.map(i => `<li>${i.name} (${i.type}) : ${i.stock} restant(s), seuil ${i.threshold}</li>`).join('');
  const to = process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL;

  if (to) {
    await sendMail({
      to,
      subject: `Alerte stock bas - ${toNotify.length} ingredient(s)`,
      html: `<p>Les ingredients suivants sont sous le seuil d'alerte :</p><ul>${listHtml}</ul>`,
    });
  }

  await Ingredient.updateMany(
    { _id: { $in: toNotify.map(i => i._id) } },
    { lowStockNotifiedAt: now }
  );

  return { checked: lowStockItems.length, notified: toNotify.length };
}

function scheduleStockCheck() {
  // Toutes les 30 minutes en production ; on garde un intervalle court car
  // le seed/la demo ne tournent que quelques minutes.
  cron.schedule('*/30 * * * *', () => {
    checkLowStock().catch(err => console.error('Erreur verification stock:', err));
  });
}

module.exports = { checkLowStock, scheduleStockCheck };
