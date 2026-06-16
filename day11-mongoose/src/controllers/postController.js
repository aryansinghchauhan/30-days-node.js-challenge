const Post         = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const filter = { published: true };

  // Text search
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [total, posts] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .select('title slug excerpt author tags publishedAt viewCount')
      .populate('author', 'username')
      .populate('tags',   'name slug')
      .sort('-publishedAt')
      .skip(skip)
      .limit(limit),
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
  const post = await Post.findBySlug(req.params.slug);
  if (!post) throw new NotFoundError('Post');

  // Increment view count
  post.viewCount += 1;
  await post.save();

  res.json({ data: post });
});

exports.create = asyncHandler(async (req, res) => {
  const { title, content, excerpt, tagIds = [] } = req.body;

  try {
    const post = await Post.create({
      title,
      content,
      excerpt,
      author: '507f1f77bcf86cd799439011', // placeholder — Week 3
      tags:   tagIds,
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'username')
      .populate('tags',   'name slug');

    res.status(201).json({ data: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.entries(err.errors).reduce((acc, [k, v]) => {
        acc[k] = v.message; return acc;
      }, {});
      return res.status(400).json({
        error: { message: 'Validation failed', code: 'VALIDATION_ERROR', fields }
      });
    }
    if (err.code === 11000) throw new ConflictError('Post with this title already exists');
    throw err;
  }
});

exports.update = asyncHandler(async (req, res) => {
  const { tagIds, title, content, excerpt } = req.body;

  const updateData = {};
  if (title)   updateData.title   = title;
  if (content) updateData.content = content;
  if (excerpt) updateData.excerpt = excerpt;
  if (tagIds)  updateData.tags    = tagIds;

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('author', 'username')
    .populate('tags',   'name slug');

  if (!post) throw new NotFoundError('Post');
  res.json({ data: post });
});

exports.publish = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new NotFoundError('Post');

  if (post.published) {
    return res.json({ data: post, message: 'Post already published' });
  }

  post.published   = true;
  post.publishedAt = new Date();
  await post.save();

  res.json({ data: post, message: 'Post published' });
});

exports.remove = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) throw new NotFoundError('Post');
  res.status(204).end();
});

// Comments
exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    slug: req.params.slug, published: true
  });
  if (!post) throw new NotFoundError('Post');

  post.comments.push({
    content: req.body.content,
    author:  '507f1f77bcf86cd799439011', // placeholder
  });

  await post.save();

  const updated = await Post.findById(post._id)
    .populate('comments.author', 'username');

  res.status(201).json({
    data:    updated.comments[updated.comments.length - 1],
    message: 'Comment added'
  });
});

exports.removeComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new NotFoundError('Post');

  const comment = post.comments.id(req.params.commentId);
  if (!comment) throw new NotFoundError('Comment');

  comment.deleteOne();
  await post.save();

  res.status(204).end();
});