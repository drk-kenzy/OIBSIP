const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'users.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readUsers() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeUsers(users) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function findByUsername(username) {
  return readUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

function findByEmail(email) {
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

function findByUsernameOrEmail(identifier) {
  const lower = identifier.toLowerCase();
  return readUsers().find(u => u.username.toLowerCase() === lower || u.email.toLowerCase() === lower);
}

function createUser({ username, email, passwordHash }) {
  const users = readUsers();
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

module.exports = { readUsers, findByUsername, findByEmail, findByUsernameOrEmail, createUser };
