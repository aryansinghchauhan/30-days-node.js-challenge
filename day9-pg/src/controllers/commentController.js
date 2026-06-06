const db           = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../errors/AppError');

exports.getByPost = asyncHandler(async (req, res) => {
  const post = await db.posts.findBySlug(req.params.slug);
  if (!post) throw new NotFoundError('Post');

  const comments = await db.comments.findByPostId(post.id);
  res.json({ data: comments, count: comments.length });
});

exports.create = asyncHandler(async (req, res) => {
  const post = await db.posts.findBySlug(req.params.slug);
  if (!post) throw new NotFoundError('Post');

  const comment = await db.comments.create({
    content: req.body.content,
    postId:  post.id,
    userId:  1, // hardcoded — Week 3 adds real auth
  });

  res.status(201).json({ data: comment });
});

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await db.comments.remove(req.params.id);
  if (!deleted) throw new NotFoundError('Comment');
  res.status(204).end();
});