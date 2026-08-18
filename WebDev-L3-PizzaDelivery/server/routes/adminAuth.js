const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

const router = express.Router();

router.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim().toLowerCase();
  const password = req.body.password || '';
  const GENERIC_ERROR = 'Identifiants incorrects.';

  if (!username || !password) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const admin = await Admin.findOne({ username });
  if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ error: GENERIC_ERROR });
  }

  const token = jwt.sign({ adminId: admin._id.toString() }, process.env.ADMIN_JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, admin: { id: admin._id, username: admin.username } });
});

module.exports = router;
