const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '..', 'data.db'));

async function run() {
  const SEED_USER = process.env.SEED_USER || 'coord';
  const SEED_PASS = process.env.SEED_PASS || 'password';
  const SEED_ROLE = process.env.SEED_ROLE || 'coord';

  // ensure tables exist (index.js creates them when server runs, but seed can run standalone)
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  )`).run();

  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(SEED_USER);
  if (existing) {
    console.log('Seed user already exists, skipping.');
    return;
  }

  const hashed = await bcrypt.hash(SEED_PASS, 10);
  const info = db.prepare('INSERT INTO users (username,password,role,name) VALUES (?,?,?,?)').run(SEED_USER, hashed, SEED_ROLE, SEED_USER);
  console.log('Seed user created:', SEED_USER);
}

run().catch((err)=>{ console.error(err); process.exit(1); });
