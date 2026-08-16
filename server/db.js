const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'data.sqlite');
const db = new Database(dbPath);

// Create basic tables
db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  class TEXT,
  meta TEXT
);
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  subject TEXT,
  meta TEXT
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  student_id INTEGER,
  teacher_id INTEGER,
  done INTEGER DEFAULT 0,
  due DATE
);
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  teacher_id INTEGER,
  value TEXT,
  subject TEXT
);
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT,
  amount REAL,
  invoice TEXT
);
CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  date TEXT,
  participants TEXT,
  notes TEXT
);
`);

module.exports = db;
