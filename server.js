// server/server.js
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- DB ----------
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Set sensible defaults
db.defaults({
  users: [
    { username: 'XEN', password: 'YOUR_SUPER_SECRET_PASSWORD', role: 'admin' }
    // add more users here if you want
  ],
  leaderboard: [],
  updated: 'never'
}).write();

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// ---------- API ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.get('users').find({ username, password }).value();

  if (user) {
    res.json({ success: true, user: { username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  const data = {
    leaderboard: db.get('leaderboard').value(),
    updated: db.get('updated').value()
  };
  res.json(data);
});

app.post('/api/leaderboard', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  // Very simple token = base64(username)
  let username;
  try { username = Buffer.from(token, 'base64').toString(); } catch { }
  if (!username) return res.status(401).json({ error: 'Invalid token' });

  const user = db.get('users').find({ username }).value();
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { leaderboard } = req.body;
  if (!Array.isArray(leaderboard)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // recalc ranks
  const ranked = leaderboard.map((p, i) => ({ ...p, rank: i + 1 }));
  const now = new Date().toISOString();

  db.set('leaderboard', ranked).set('updated', now).write();

  // also write a static JSON file for the old fetch method (optional)
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, '../public/leaderboard.json'),
    JSON.stringify({ leaderboard: ranked, updated: now }, null, 2)
  );

  res.json({ success: true, updated: now });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});