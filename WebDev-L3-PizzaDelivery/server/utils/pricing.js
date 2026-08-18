const PRICE_BASE = 8.99;
const PRICE_PER_VEGGIE = 0.75;

const Ingredient = require('../models/Ingredient');

/**
 * Reloads and validates the ingredients chosen for a pizza, ensuring each
 * exists, has the right type and is in stock. Never trusts a client-supplied
 * price. Throws { status, message } on any validation failure.
 */
async function resolvePizzaSelection({ baseId, sauceId, cheeseId, veggieIds }) {
  const veggieIdList = Array.isArray(veggieIds) ? veggieIds : [];

  const [base, sauce, cheese, veggies] = await Promise.all([
    Ingredient.findOne({ _id: baseId, type: 'base' }),
    Ingredient.findOne({ _id: sauceId, type: 'sauce' }),
    Ingredient.findOne({ _id: cheeseId, type: 'cheese' }),
    Ingredient.find({ _id: { $in: veggieIdList }, type: 'veggie' }),
  ]);

  if (!base || !sauce || !cheese) {
    throw { status: 400, message: 'Selection de pizza invalide (pate, sauce ou fromage manquant).' };
  }
  if (veggies.length !== veggieIdList.length) {
    throw { status: 400, message: "Un ou plusieurs legumes selectionnes n'existent plus." };
  }

  const allSelected = [base, sauce, cheese, ...veggies];
  const outOfStock = allSelected.find(item => item.stock < 1);
  if (outOfStock) {
    throw { status: 409, message: `Ingredient en rupture de stock : ${outOfStock.name}.` };
  }

  const total = Math.round((PRICE_BASE + veggies.length * PRICE_PER_VEGGIE) * 100) / 100;

  return { base, sauce, cheese, veggies, total };
}

module.exports = { PRICE_BASE, PRICE_PER_VEGGIE, resolvePizzaSelection };
