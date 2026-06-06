const db           = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError, handleDbError } = require('../errors/AppError');

exports.getAll = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.users.findAll({ limit, offset }),
    db.users.count(),
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
  const user = await db.users.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json({ data: user });
});

exports.create = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;

  const [usernameTaken, emailTaken] = await Promise.all([
    db.users.usernameExists(username),
    db.users.emailExists(email),
  ]);

  if (usernameTaken) throw new ConflictError('Username already taken');
  if (emailTaken)    throw new ConflictError('Email already registered');

  try {
    const user = await db.users.create({
      username,
      email,
      passwordHash: 'placeholder_hash',
      bio,
    });
    res.status(201).json({ data: user });
  } catch (err) {
    throw handleDbError(err);
  }
});

exports.update = asyncHandler(async (req, res) => {
  const user = await db.users.update(req.params.id, req.body);
  if (!user) throw new NotFoundError('User');
  res.json({ data: user });
});

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await db.users.remove(req.params.id);
  if (!deleted) throw new NotFoundError('User');
  res.status(204).end();
});