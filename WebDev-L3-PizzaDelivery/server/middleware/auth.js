const jwt = require('jsonwebtoken');

function getToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function requireUser(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Authentification requise.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expiree.' });
  }
}

function requireAdmin(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Authentification admin requise.' });
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.adminId = payload.adminId;
    next();
  } catch {
    return res.status(401).json({ error: 'Session admin invalide ou expiree.' });
  }
}

module.exports = { requireUser, requireAdmin };
