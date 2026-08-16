const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Simple role middleware: pass role in header 'x-role' (student|teacher|coord)
app.use((req, res, next) => {
  req.user = { role: (req.headers['x-role'] || 'guest') };
  next();
});

// Students
app.get('/students', (req, res) => {
  const rows = db.prepare('SELECT * FROM students').all();
  res.json(rows);
});
app.post('/students', (req, res) => {
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
app.post('/tasks', (req, res) => {
  const { title, description, student_id, teacher_id, due } = req.body;
  const stmt = db.prepare('INSERT INTO tasks (title, description, student_id, teacher_id, due) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(title, description || '', student_id || null, teacher_id || null, due || null);
  res.json({ id: info.lastInsertRowid });
});
app.put('/tasks/:id/toggle', (req, res) => {
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
app.post('/teachers', (req, res) => {
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
app.post('/purchases', (req, res) => {
  const { description, amount, invoice } = req.body;
  const stmt = db.prepare('INSERT INTO purchases (description, amount, invoice) VALUES (?, ?, ?)');
  const info = stmt.run(description, amount || 0, invoice || '');
  res.json({ id: info.lastInsertRowid });
});

app.get('/meetings', (req, res) => {
  const rows = db.prepare('SELECT * FROM meetings').all();
  res.json(rows);
});
app.post('/meetings', (req, res) => {
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
