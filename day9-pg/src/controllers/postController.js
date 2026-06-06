const db           = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, handleDbError } = require('../errors/AppError');

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

exports.getAll = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    db.posts.findAll({ limit, offset }),
    db.posts.countPublished(),
  ]);

  res.json({
    data: posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page * limit < total,
      hasPrev:    page > 1,
    },
  });
});

exports.getOne = asyncHandler(async (req, res) => {
  const post = await db.posts.findBySlug(req.params.slug);
  if (!post) throw new NotFoundError('Post');
  res.json({ data: post });
});

exports.create = asyncHandler(async (req, res) => {
  const { title, content, excerpt } = req.body;
  const userId = 1; // hardcoded — Week 3 adds real auth

  let slug = generateSlug(title);
  if (await db.posts.slugExists(slug)) {
    slug = `${slug}-${Date.now()}`;
  }

  try {
    const post = await db.posts.create({ title, slug, content, excerpt, userId });
    res.status(201).json({ data: post });
  } catch (err) {
    throw handleDbError(err);
  }
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await db.posts.findById(req.params.id);
  if (!existing) throw new NotFoundError('Post');

  const post = await db.posts.update(req.params.id, req.body);
  res.json({ data: post });
});

exports.publish = asyncHandler(async (req, res) => {
  const post = await db.posts.findById(req.params.id);
  if (!post) throw new NotFoundError('Post');

  if (post.published) {
    return res.json({ data: post, message: 'Post is already published' });
  }

  const published = await db.posts.publish(req.params.id);
  res.json({ data: published, message: 'Post published successfully' });
});

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await db.posts.remove(req.params.id);
  if (!deleted) throw new NotFoundError('Post');
  res.status(204).end();
});