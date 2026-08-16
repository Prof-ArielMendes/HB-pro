const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Auth middleware: verify JWT from Authorization header
app.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')){
    const token = auth.slice(7);
    try{
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; // { id, username, role }
    }catch(e){
      req.user = { role: 'guest' };
    }
  } else {
    req.user = { role: 'guest' };
  }
  next();
});

function authRequired(req, res, next){
  if (!req.user || !req.user.role || req.user.role === 'guest') return res.status(401).json({ error: 'authentication required' });
  next();
}
function roleRequired(role){
  return (req, res, next)=>{
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// Authentication routes
app.post('/auth/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const hash = bcrypt.hashSync(password, 10);
  try{
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role, meta) VALUES (?, ?, ?, ?)');
    const info = stmt.run(username, hash, role || 'student', JSON.stringify({}));
    const user = { id: info.lastInsertRowid, username, role: role || 'student' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  }catch(e){
    res.status(400).json({ error: 'username already exists' });
  }
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const row = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const user = { id: row.id, username: row.username, role: row.role };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Students
app.get('/students', (req, res) => {
  const rows = db.prepare('SELECT * FROM students').all();
  res.json(rows);
});
app.post('/students', authRequired, (req, res) => {
  const { name, class: clazz, meta } = req.body;
  const stmt = db.prepare('INSERT INTO students (name, class, meta) VALUES (?, ?, ?)');
  const info = stmt.run(name, clazz || '', JSON.stringify(meta || {}));
  res.json({ id: info.lastInsertRowid });
});

// Tasks
app.get('/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks').all();
  res.json(rows);
});
app.post('/tasks', authRequired, (req, res) => {
  const { title, description, student_id, teacher_id, due } = req.body;
  const stmt = db.prepare('INSERT INTO tasks (title, description, student_id, teacher_id, due) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(title, description || '', student_id || null, teacher_id || null, due || null);
  res.json({ id: info.lastInsertRowid });
});
app.put('/tasks/:id/toggle', authRequired, (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT done FROM tasks WHERE id = ?').get(id);
  const done = row ? (row.done ? 0 : 1) : 1;
  db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done, id);
  res.json({ id, done });
});

// Teachers
app.get('/teachers', (req, res) => {
  const rows = db.prepare('SELECT * FROM teachers').all();
  res.json(rows);
});
app.post('/teachers', authRequired, (req, res) => {
  const { name, subject, meta } = req.body;
  const stmt = db.prepare('INSERT INTO teachers (name, subject, meta) VALUES (?, ?, ?)');
  const info = stmt.run(name, subject || '', JSON.stringify(meta || {}));
  res.json({ id: info.lastInsertRowid });
});

// Management endpoints (purchases, meetings)
app.get('/purchases', (req, res) => {
  const rows = db.prepare('SELECT * FROM purchases').all();
  res.json(rows);
});
app.post('/purchases', authRequired, roleRequired('coord'), (req, res) => {
  const { description, amount, invoice } = req.body;
  const stmt = db.prepare('INSERT INTO purchases (description, amount, invoice) VALUES (?, ?, ?)');
  const info = stmt.run(description, amount || 0, invoice || '');
  res.json({ id: info.lastInsertRowid });
});

app.get('/meetings', (req, res) => {
  const rows = db.prepare('SELECT * FROM meetings').all();
  res.json(rows);
});
app.post('/meetings', authRequired, roleRequired('coord'), (req, res) => {
  const { title, date, participants, notes } = req.body;
  const stmt = db.prepare('INSERT INTO meetings (title, date, participants, notes) VALUES (?, ?, ?, ?)');
  const info = stmt.run(title, date || '', JSON.stringify(participants || []), notes || '');
  res.json({ id: info.lastInsertRowid });
});

const PORT = process.env.PORT || 4000;
function startServer(port = PORT){
  return app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
