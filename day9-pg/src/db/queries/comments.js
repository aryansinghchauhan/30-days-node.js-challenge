const db = require('../pool');

async function findByPostId(postId) {
  const result = await db.query(
    `SELECT
       c.id, c.content, c.created_at, c.updated_at,
       u.id       AS author_id,
       u.username AS author_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
}

async function create({ content, postId, userId }) {
  const result = await db.query(
    `INSERT INTO comments (content, post_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING id, content, post_id, user_id, created_at`,
    [content, postId, userId]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    'SELECT * FROM comments WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM comments WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
}

module.exports = { findByPostId, create, findById, remove };