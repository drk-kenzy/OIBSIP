const express = require('express');
const Ingredient = require('../models/Ingredient');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public : options disponibles pour construire une pizza (dashboard utilisateur)
router.get('/', async (req, res) => {
  const ingredients = await Ingredient.find().sort({ type: 1, name: 1 });
  res.json({ ingredients });
});

// Admin : mise a jour manuelle du stock et/ou du seuil d'alerte
router.patch('/:id', requireAdmin, async (req, res) => {
  const { stock, threshold } = req.body;
  const update = {};
  if (stock !== undefined) {
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Le stock doit etre un nombre positif.' });
    }
    update.stock = stock;
    update.lowStockNotifiedAt = null; // reset : une reappro peut redeclencher une alerte plus tard
  }
  if (threshold !== undefined) {
    if (typeof threshold !== 'number' || threshold < 0) {
      return res.status(400).json({ error: 'Le seuil doit etre un nombre positif.' });
    }
    update.threshold = threshold;
  }

  const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!ingredient) return res.status(404).json({ error: 'Ingredient introuvable.' });

  res.json({ ingredient });
});

module.exports = router;
