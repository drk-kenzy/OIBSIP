const nodemailer = require('nodemailer');

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }

    const testAccount = await nodemailer.createTestAccount();
    console.log('SMTP absent : compte de test Ethereal cree pour le developpement (emails captures, jamais envoyes reellement).');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  })();

  return transporterPromise;
}

async function sendMail({ to, subject, html }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Pizza Delivery <no-reply@pizzadelivery.example>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Email envoye (apercu Ethereal) : ${previewUrl}`);
  }
  return { previewUrl };
}

module.exports = { sendMail };
