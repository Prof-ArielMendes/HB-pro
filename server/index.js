const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Initialize DB schema
db.pragma('journal_mode = WAL');

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT,
  name TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  classroom TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  done INTEGER DEFAULT 0,
  student_id INTEGER,
  teacher_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student TEXT,
  subject TEXT,
  value REAL,
  created_at TEXT DEFAULT (datetime('now'))
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item TEXT,
  provider TEXT,
  value REAL,
  created_at TEXT DEFAULT (datetime('now'))
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  date TEXT,
  participants TEXT
)`).run();

app.use(cors());
app.use(express.json());

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function roleIn(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

app.get('/health', (req, res) => res.json({ ok: true }));

// Auth
app.post('/auth/register', async (req, res) => {
  const { username, password, role = 'student', name } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  // Password strength: at least 8 chars, contains letter and number
  const pwd = password || '';
  const hasMin = pwd.length >= 8;
  const hasNumber = /[0-9]/.test(pwd);
  const hasLetter = /[a-zA-Z]/.test(pwd);
  if (!hasMin || !hasNumber || !hasLetter) {
    return res.status(400).json({ error: 'Senha fraca: mínimo 8 caracteres e deve conter letras e números.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (username,password,role,name) VALUES (?,?,?,?)').run(username, hashed, role, name || username);
    const user = { id: info.lastInsertRowid, username, role };
    res.json({ token: signToken(user), user });
  } catch (err) {
    return res.status(400).json({ error: 'user exists' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const user = { id: row.id, username: row.username, role: row.role };
  res.json({ token: signToken(user), user });
});

// Students & teachers
app.get('/students', authRequired, roleIn(['teacher','coord']), (req, res) => {
  const rows = db.prepare('SELECT * FROM students').all();
  res.json(rows);
});

app.get('/teachers', authRequired, roleIn(['teacher','coord']), (req, res) => {
  const rows = db.prepare("SELECT id, username, role, name FROM users WHERE role = 'teacher'").all();
  res.json(rows);
});

// Tasks
app.get('/tasks', authRequired, roleIn(['coord']), (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/my/tasks', authRequired, (req, res) => {
  const { role, id } = req.user;
  if (role === 'coord') {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    return res.json(rows);
  }
  if (role === 'teacher') {
    const rows = db.prepare('SELECT * FROM tasks WHERE teacher_id = ? ORDER BY created_at DESC').all(id);
    return res.json(rows);
  }
  // student
  const rows = db.prepare('SELECT * FROM tasks WHERE student_id = ? ORDER BY created_at DESC').all(id);
  res.json(rows);
});

app.post('/tasks', authRequired, roleIn(['teacher','coord']), (req, res) => {
  const { title, description, student_id } = req.body;
  const teacher_id = req.user.id;
  if (!title) return res.status(400).json({ error: 'title required' });
  const info = db.prepare('INSERT INTO tasks (title,description,student_id,teacher_id) VALUES (?,?,?,?)').run(title, description || '', student_id || null, teacher_id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.json(task);
});

app.put('/tasks/:id/toggle', authRequired, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  // allow teacher of the task, the student assigned, or coord
  const allowed = req.user.role === 'coord' || req.user.id === row.teacher_id || req.user.id === row.student_id;
  if (!allowed) return res.status(403).json({ error: 'forbidden' });
  const done = row.done ? 0 : 1;
  db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done, id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
});

app.delete('/tasks/:id', authRequired, roleIn(['teacher','coord']), (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Grades, purchases, meetings (basic endpoints)
app.get('/grades', authRequired, roleIn(['teacher','coord']), (req, res) => {
  const rows = db.prepare('SELECT * FROM grades ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/grades', authRequired, roleIn(['teacher','coord']), (req, res) => {
  const { student, subject, value } = req.body;
  const info = db.prepare('INSERT INTO grades (student,subject,value) VALUES (?,?,?)').run(student, subject, value);
  res.json(db.prepare('SELECT * FROM grades WHERE id = ?').get(info.lastInsertRowid));
});

app.get('/purchases', authRequired, roleIn(['coord']), (req, res) => {
  const rows = db.prepare('SELECT * FROM purchases ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/purchases', authRequired, roleIn(['coord']), (req, res) => {
  const { item, provider, value } = req.body;
  const info = db.prepare('INSERT INTO purchases (item,provider,value) VALUES (?,?,?)').run(item, provider, value);
  res.json(db.prepare('SELECT * FROM purchases WHERE id = ?').get(info.lastInsertRowid));
});

app.get('/meetings', authRequired, roleIn(['coord','teacher']), (req, res) => {
  const rows = db.prepare('SELECT * FROM meetings ORDER BY date DESC').all();
  res.json(rows);
});

app.post('/meetings', authRequired, roleIn(['coord']), (req, res) => {
  const { title, date, participants } = req.body;
  const info = db.prepare('INSERT INTO meetings (title,date,participants) VALUES (?,?,?)').run(title, date, participants);
  res.json(db.prepare('SELECT * FROM meetings WHERE id = ?').get(info.lastInsertRowid));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Servidor escolar em http://localhost:${port}`);
});
