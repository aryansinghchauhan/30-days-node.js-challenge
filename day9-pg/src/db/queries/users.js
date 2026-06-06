const db = require('../pool');

async function findById(id) {
  const result = await db.query(
    `SELECT id, username, email, bio, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query(
    `SELECT id, username, email, password_hash, is_active
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

async function findAll({ limit = 10, offset = 0 } = {}) {
  const result = await db.query(
    `SELECT id, username, email, bio, is_active, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

async function count() {
  const result = await db.query(
    'SELECT COUNT(*) as total FROM users'
  );
  return parseInt(result.rows[0].total);
}

async function create({ username, email, passwordHash, bio }) {
  const result = await db.query(
    `INSERT INTO users (username, email, password_hash, bio)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, bio, is_active, created_at`,
    [username, email, passwordHash, bio || null]
  );
  return result.rows[0];
}

async function update(id, { username, bio }) {
  const result = await db.query(
    `UPDATE users
     SET
       username   = COALESCE($2, username),
       bio        = COALESCE($3, bio),
       updated_at = NOW()
     WHERE id = $1
     RETURNING id, username, email, bio, updated_at`,
    [id, username || null, bio || null]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
}

async function usernameExists(username) {
  const result = await db.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  return result.rows.length > 0;
}

async function emailExists(email) {
  const result = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  return result.rows.length > 0;
}

module.exports = {
  findById, findByEmail, findAll, count,
  create, update, remove,
  usernameExists, emailExists,
};