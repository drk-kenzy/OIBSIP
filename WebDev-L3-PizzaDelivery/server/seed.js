const bcrypt = require('bcryptjs');

const Ingredient = require('./models/Ingredient');
const Admin = require('./models/Admin');

const BASES = ['Pâte fine', 'Pâte épaisse', 'Pâte sans gluten', 'Pâte complète', 'Pâte farcie au fromage'];
const SAUCES = ['Tomate classique', 'Barbecue', 'Crème fraîche', 'Pesto', 'Piquante'];
const CHEESES = ['Mozzarella', 'Emmental', 'Chèvre', 'Parmesan'];
const VEGGIES = ['Champignons', 'Poivrons', 'Oignons rouges', 'Olives noires', 'Maïs', 'Roquette', 'Tomates cerises', 'Artichauts'];

async function runSeed() {
  await Ingredient.deleteMany({});
  const docs = [
    ...BASES.map(name => ({ type: 'base', name, stock: 20, threshold: 5 })),
    ...SAUCES.map(name => ({ type: 'sauce', name, stock: 20, threshold: 5 })),
    ...CHEESES.map(name => ({ type: 'cheese', name, stock: 20, threshold: 5 })),
    ...VEGGIES.map(name => ({ type: 'veggie', name, stock: 15, threshold: 5 })),
  ];
  // Un ingredient volontairement bas pour demontrer l'alerte de stock
  docs[docs.length - 1].stock = 3;
  await Ingredient.insertMany(docs);

  await Admin.deleteMany({});
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.example';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  await Admin.create({
    username: adminEmail,
    passwordHash: bcrypt.hashSync(adminPassword, 10),
  });

  return { ingredients: docs.length, adminEmail, adminPassword };
}

/** Seed only if the database looks empty (used on server boot). Idempotent. */
async function seedIfEmpty() {
  const count = await Ingredient.countDocuments();
  if (count > 0) return null;
  const result = await runSeed();
  console.log(`Base vide detectee : ${result.ingredients} ingredients et le compte admin (${result.adminEmail} / ${result.adminPassword}) ont ete crees automatiquement.`);
  return result;
}

module.exports = { runSeed, seedIfEmpty };

if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('./config/db');
  connectDB()
    .then(runSeed)
    .then(result => {
      console.log(`${result.ingredients} ingredients crees.`);
      console.log(`Compte admin cree : ${result.adminEmail} / ${result.adminPassword}`);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
