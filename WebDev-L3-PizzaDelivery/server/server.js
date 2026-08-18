require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const setupSockets = require('./sockets');
const { scheduleStockCheck } = require('./cron/stockCheck');
const { seedIfEmpty } = require('./seed');

const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const ingredientRoutes = require('./routes/ingredients');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');

const REQUIRED_ENV = ['JWT_SECRET', 'ADMIN_JWT_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`${key} manquant. Copie .env.example vers .env et renseigne les secrets.`);
    process.exit(1);
  }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
});

app.set('io', io);
setupSockets(io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => seedIfEmpty())
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API Pizza Delivery demarree sur http://localhost:${PORT}`);
      scheduleStockCheck();
    });
  })
  .catch(err => {
    console.error('Echec de connexion a MongoDB:', err);
    process.exit(1);
  });
