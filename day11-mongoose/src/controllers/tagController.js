const Tag          = require('../models/Tag');
const Post         = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort('name');
  res.json({ data: tags, count: tags.length });
});

exports.create = asyncHandler(async (req, res) => {
  try {
    const tag = await Tag.create({ name: req.body.name });
    res.status(201).json({ data: tag });
  } catch (err) {
    if (err.code === 11000) throw new ConflictError('Tag already exists');
    throw err;
  }
});

exports.getPostsByTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) throw new NotFoundError('Tag');

  const posts = await Post.find({ tags: tag._id, published: true })
    .select('title slug excerpt publishedAt')
    .populate('author', 'username')
    .sort('-publishedAt');

  res.json({ data: posts, tag, count: posts.length });
});