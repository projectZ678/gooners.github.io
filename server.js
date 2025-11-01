// server/server.js
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// DB
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

db.defaults({
  users: [],
  leaderboard: [],
  updated: 'never'
}).write();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Session check middleware
const requireAuth = (req, res, next) => {
  const session = req.cookies.session;
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const user = db.get('users').find({ session }).value();
  if (!user) return res.status(401).json({ error: 'Invalid session' });

  req.user = user;
  next();
};

// === AUTH ROUTES ===
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const exists = db.get('users').find({ username }).value();
  if (exists) return res.status(400).json({ error: 'Username taken' });

  const hash = await bcrypt.hash(password, 10);
  const isAdmin = username.toLowerCase() === 'xen'; // auto-admin for XEN
  const session = Buffer.from(`${username}:${Date.now()}:${Math.random()}`).toString('base64');

  db.get('users').push({
    username,
    password: hash,
    role: isAdmin ? 'admin' : 'user',
    session
  }).write();

  res.cookie('session', session, { httpOnly: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, user: { username, role: isAdmin ? 'admin' : 'user' } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.get('users').find({ username }).value();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const session = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  db.get('users').find({ username }).assign({ session }).write();

  res.cookie('session', session, { httpOnly: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, user: { username: user.username, role: user.role } });
});

app.post('/api/logout', (req, res) => {
  const session = req.cookies.session;
  if (session) {
    db.get('users').remove({ session }).write();
  }
  res.clearCookie('session');
  res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: { username: req.user.username, role: req.user.role } });
});

// === LEADERBOARD ROUTES ===
app.get('/api/leaderboard', (req, res) => {
  const data = {
    leaderboard: db.get('leaderboard').value(),
    updated: db.get('updated').value()
  };
  res.json(data);
});

app.post('/api/leaderboard', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  let { leaderboard } = req.body;
  if (!Array.isArray(leaderboard)) return res.status(400).json({ error: 'Invalid data' });

  // Auto-rank
  leaderboard = leaderboard.map((p, i) => ({ ...p, rank: i + 1 }));
  const now = new Date().toISOString();

  db.set('leaderboard', leaderboard).set('updated', now).write();

  // Write static JSON for legacy clients
  fs.writeFileSync(
    path.join(__dirname, '../public/leaderboard.json'),
    JSON.stringify({ leaderboard, updated: now }, null, 2)
  );

  res.json({ success: true, updated: now });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
