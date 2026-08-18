const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendMail } = require('../config/mailer');
const { randomToken } = require('../utils/tokens');
const { requireUser } = require('../middleware/auth');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const RESET_TTL_MS = 1000 * 60 * 30; // 30 min

router.post('/register', async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caracteres et un chiffre.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe deja avec cet email.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const verifyToken = randomToken();

  const user = await User.create({
    name,
    email,
    passwordHash,
    verifyToken,
    verifyTokenExpiry: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  const { previewUrl } = await sendMail({
    to: email,
    subject: 'Confirme ton compte Pizza Delivery',
    html: `<p>Bonjour ${name},</p><p>Confirme ton adresse email en cliquant sur ce lien (valide 24h) :</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  res.status(201).json({
    message: 'Compte cree. Verifie ta boite mail pour confirmer ton adresse avant de te connecter.',
    devEmailPreviewUrl: previewUrl || null,
  });
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Jeton manquant.' });

  const user = await User.findOne({ verifyToken: token, verifyTokenExpiry: { $gt: new Date() } });
  if (!user) {
    return res.status(400).json({ error: 'Lien de verification invalide ou expire.' });
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Email confirme, tu peux te connecter.' });
});

router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const GENERIC_ERROR = 'Identifiants incorrects.';

  if (!email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: GENERIC_ERROR });
  }
  if (!user.isVerified) {
    return res.status(403).json({ error: "Confirme d'abord ton adresse email avant de te connecter." });
  }

  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.get('/me', requireUser, async (req, res) => {
  const user = await User.findById(req.userId).select('name email createdAt');
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  res.json({ user });
});

router.post('/forgot-password', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const GENERIC_MESSAGE = 'Si un compte existe avec cet email, un lien de reinitialisation vient d\'etre envoye.';

  if (!email) return res.status(400).json({ error: 'Email requis.' });

  const user = await User.findOne({ email });
  if (!user) {
    // Ne pas reveler si l'email existe ou non.
    return res.json({ message: GENERIC_MESSAGE });
  }

  const resetToken = randomToken();
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + RESET_TTL_MS);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const { previewUrl } = await sendMail({
    to: email,
    subject: 'Reinitialise ton mot de passe Pizza Delivery',
    html: `<p>Voici ton lien de reinitialisation (valide 30 minutes) :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si tu n'es pas a l'origine de cette demande, ignore cet email.</p>`,
  });

  res.json({ message: GENERIC_MESSAGE, devEmailPreviewUrl: previewUrl || null });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Jeton et mot de passe requis.' });
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caracteres et un chiffre.' });
  }

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
  if (!user) {
    return res.status(400).json({ error: 'Lien de reinitialisation invalide ou expire.' });
  }

  user.passwordHash = bcrypt.hashSync(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Mot de passe mis a jour, tu peux te connecter.' });
});

module.exports = router;
