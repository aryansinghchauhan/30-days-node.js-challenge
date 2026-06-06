const db = require('../pool');

async function findAll({ limit = 10, offset = 0 } = {}) {
  const result = await db.query(
    `SELECT
       p.id, p.title, p.slug, p.excerpt,
       p.published_at, p.created_at,
       u.id       AS author_id,
       u.username AS author_name,
       COUNT(c.id)::int AS comment_count
     FROM posts p
     JOIN  users    u ON p.user_id  = u.id
     LEFT JOIN comments c ON c.post_id = p.id
     WHERE p.published = true
     GROUP BY p.id, u.id
     ORDER BY p.published_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

async function countPublished() {
  const result = await db.query(
    'SELECT COUNT(*) as total FROM posts WHERE published = true'
  );
  return parseInt(result.rows[0].total);
}

async function findBySlug(slug) {
  const result = await db.query(
    `SELECT
       p.id, p.title, p.slug, p.content, p.excerpt,
       p.published, p.published_at, p.created_at, p.updated_at,
       u.id       AS author_id,
       u.username AS author_name,
       u.bio      AS author_bio
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.slug = $1 AND p.published = true`,
    [slug]
  );

  if (!result.rows[0]) return null;

  const post       = result.rows[0];
  const tagsResult = await db.query(
    `SELECT t.id, t.name, t.slug
     FROM tags t
     JOIN post_tags pt ON pt.tag_id = t.id
     WHERE pt.post_id = $1`,
    [post.id]
  );
  post.tags = tagsResult.rows;
  return post;
}

async function findById(id) {
  const result = await db.query(
    `SELECT p.*, u.username AS author_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function create({ title, slug, content, excerpt, userId }) {
  const result = await db.query(
    `INSERT INTO posts (title, slug, content, excerpt, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, slug, content, excerpt || null, userId]
  );
  return result.rows[0];
}

async function publish(id) {
  const result = await db.query(
    `UPDATE posts
     SET published = true, published_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function update(id, { title, content, excerpt }) {
  const result = await db.query(
    `UPDATE posts
     SET
       title      = COALESCE($2, title),
       content    = COALESCE($3, content),
       excerpt    = COALESCE($4, excerpt),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title || null, content || null, excerpt || null]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM posts WHERE id = $1 RETURNING id, title',
    [id]
  );
  return result.rows[0];
}

async function slugExists(slug) {
  const result = await db.query(
    'SELECT id FROM posts WHERE slug = $1',
    [slug]
  );
  return result.rows.length > 0;
}

module.exports = {
  findAll, countPublished, findBySlug, findById,
  create, publish, update, remove, slugExists,
};