const User         = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [total, users] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.find({ isActive: true })
      .select('username email bio role createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    data: users,
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
  const user = await User.findById(req.params.id)
    .select('username email bio role createdAt');
  if (!user) throw new NotFoundError('User');
  res.json({ data: user });
});

exports.create = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;

  const existing = await User.findOne({
    $or: [{ username }, { email }]
  }).select('username email');

  if (existing?.username === username) throw new ConflictError('Username already taken');
  if (existing?.email    === email)    throw new ConflictError('Email already registered');

  try {
    const user = await User.create({
      username,
      email,
      passwordHash: 'placeholder_hash',
      bio,
    });

    res.status(201).json({
      data: {
        _id:       user._id,
        username:  user.username,
        email:     user.email,
        bio:       user.bio,
        role:      user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.entries(err.errors).reduce((acc, [k, v]) => {
        acc[k] = v.message; return acc;
      }, {});
      return res.status(400).json({
        error: { message: 'Validation failed', code: 'VALIDATION_ERROR', fields }
      });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      throw new ConflictError(`${field} already exists`);
    }
    throw err;
  }
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('username email bio role updatedAt');

  if (!user) throw new NotFoundError('User');
  res.json({ data: user });
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.status(204).end();
});