const mongoose = require('mongoose');

const ingredientRefSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  name: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pizza: {
    base: { type: ingredientRefSchema, required: true },
    sauce: { type: ingredientRefSchema, required: true },
    cheese: { type: ingredientRefSchema, required: true },
    veggies: { type: [ingredientRefSchema], default: [] },
  },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['recue', 'en_cuisine', 'en_livraison', 'livree'],
    default: 'recue',
  },
  paymentStatus: { type: String, enum: ['en_attente', 'payee', 'echouee'], default: 'en_attente' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
