const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['base', 'sauce', 'cheese', 'veggie'] },
  name: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  threshold: { type: Number, required: true, default: 5 },
  lowStockNotifiedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);
