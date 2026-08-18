require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const store = require('./store');
const { registerPage, loginPage, dashboardPage } = require('./views');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.error('SESSION_SECRET manquant. Copie .env.example vers .env et renseigne une valeur.');
  process.exit(1);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/;

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 },
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res) => {
  res.redirect(req.session.userId ? '/dashboard' : '/login');
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.send(registerPage({}));
});

app.post('/register', (req, res) => {
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const values = { username, email };

  if (!username || !email || !password) {
    return res.status(400).send(registerPage({ error: 'Tous les champs sont obligatoires.', values }));
  }
  if (username.length < 3) {
    return res.status(400).send(registerPage({ error: "Le nom d'utilisateur doit contenir au moins 3 caractères.", values }));
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).send(registerPage({ error: "Adresse email invalide.", values }));
  }
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).send(registerPage({ error: 'Le mot de passe doit contenir au moins 8 caractères et au moins un chiffre.', values }));
  }
  if (store.findByUsername(username)) {
    return res.status(409).send(registerPage({ error: "Ce nom d'utilisateur est déjà utilisé.", values }));
  }
  if (store.findByEmail(email)) {
    return res.status(409).send(registerPage({ error: 'Cet email est déjà associé à un compte.', values }));
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  store.createUser({ username, email, passwordHash });

  res.redirect('/login?registered=1');
});

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  const notice = req.query.registered ? 'Compte créé avec succès, tu peux te connecter.' : null;
  res.send(loginPage({ notice }));
});

app.post('/login', (req, res) => {
  const identifier = (req.body.identifier || '').trim();
  const password = req.body.password || '';
  const values = { identifier };
  const GENERIC_ERROR = 'Identifiants incorrects.';

  if (!identifier || !password) {
    return res.status(400).send(loginPage({ error: 'Tous les champs sont obligatoires.', values }));
  }

  const user = store.findByUsernameOrEmail(identifier);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).send(loginPage({ error: GENERIC_ERROR, values }));
  }

  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.get('/dashboard', requireAuth, (req, res) => {
  const user = store.readUsers().find(u => u.id === req.session.userId);
  if (!user) {
    req.session.destroy(() => res.redirect('/login'));
    return;
  }
  res.send(dashboardPage({ user }));
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`OIBSIP LoginAuth démarré sur http://localhost:${PORT}`);
});
