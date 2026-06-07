const prisma       = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../errors/AppError');

// GET /tags
exports.getAll = asyncHandler(async (req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: {
      id:   true,
      name: true,
      slug: true,
      _count: { select: { posts: true } }
    }
  });
  res.json({ data: tags, count: tags.length });
});

// GET /tags/:slug/posts
exports.getPostsByTag = asyncHandler(async (req, res) => {
  const tag = await prisma.tag.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, name: true }
  });
  if (!tag) throw new NotFoundError('Tag');

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      tags: { some: { slug: req.params.slug } }
    },
    select: {
      id: true, title: true, slug: true,
      excerpt: true, publishedAt: true,
      author: { select: { id: true, username: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { publishedAt: 'desc' }
  });

  res.json({ data: posts, tag, count: posts.length });
});

// POST /tags
exports.create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

  const exists = await prisma.tag.findUnique({
    where: { slug }, select: { id: true }
  });
  if (exists) throw new ConflictError(`Tag "${name}" already exists`);

  const tag = await prisma.tag.create({
    data: { name: name.trim(), slug }
  });

  res.status(201).json({ data: tag });
});