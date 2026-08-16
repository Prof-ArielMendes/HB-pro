const db = require('../db');
const bcrypt = require('bcryptjs');

const username = process.env.SEED_USER || 'coord';
const password = process.env.SEED_PASS || 'senha';
const role = process.env.SEED_ROLE || 'coord';

try{
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists){
    console.log(`User '${username}' already exists (id=${exists.id}).`);
    process.exit(0);
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash, role, meta) VALUES (?, ?, ?, ?)')
    .run(username, hash, role, JSON.stringify({ seeded: true }));
  console.log('Seeded user:', { id: info.lastInsertRowid, username, role });
  process.exit(0);
}catch(err){
  console.error('Failed to seed user:', err.message);
  process.exit(1);
}
