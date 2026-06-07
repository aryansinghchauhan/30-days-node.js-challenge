const prisma       = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../errors/AppError');

// GET /posts/:slug/comments
exports.getByPost = asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, published: true }
  });
  if (!post || !post.published) throw new NotFoundError('Post');

  const comments = await prisma.comment.findMany({
    where:   { postId: post.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id:        true,
      content:   true,
      createdAt: true,
      author: {
        select: { id: true, username: true }
      }
    }
  });

  res.json({ data: comments, count: comments.length });
});

// POST /posts/:slug/comments
exports.create = asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, published: true }
  });
  if (!post || !post.published) throw new NotFoundError('Post');

  const comment = await prisma.comment.create({
    data: {
      content: req.body.content,
      postId:  post.id,
      userId:  1, // hardcoded — Week 3
    },
    select: {
      id: true, content: true, createdAt: true,
      author: { select: { id: true, username: true } }
    }
  });

  res.status(201).json({ data: comment });
});

// DELETE /comments/:id
exports.remove = asyncHandler(async (req, res) => {
  const exists = await prisma.comment.findUnique({
    where: { id: req.params.id }, select: { id: true }
  });
  if (!exists) throw new NotFoundError('Comment');

  await prisma.comment.delete({ where: { id: req.params.id } });
  res.status(204).end();
});