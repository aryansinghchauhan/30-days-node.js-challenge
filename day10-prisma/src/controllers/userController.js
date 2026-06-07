const prisma    = require('../db/prisma');
const asyncHandler   = require('../utils/asyncHandler');
const {NotFoundError,ConflictError}=require('../errors/AppError');

const USER_SELECT = {
    id:      true,
    username:true,
    email:   true,
    bio:     true,
    isActive:true,
    createdAt:true,
    uodatedAt:true,
};

// GET /users
exports.getAll = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  // Run count and fetch in parallel
  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      select:  USER_SELECT,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
    }),
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

// GET /users/:id
exports.getOne = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.params.id },
    select: {
      ...USER_SELECT,
      // Include post count
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) throw new NotFoundError('User');
  res.json({ data: user });
});

// POST /users
exports.create = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;

  // Check duplicates
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }]
    },
    select: { username: true, email: true }
  });

  if (existing?.username === username) throw new ConflictError('Username already taken');
  if (existing?.email    === email)    throw new ConflictError('Email already registered');

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: 'placeholder_hash', // Week 3 replaces this
      bio,
    },
    select: USER_SELECT,
  });

  res.status(201).json({ data: user });
});

// PATCH /users/:id
exports.update = asyncHandler(async (req, res) => {
  // Check user exists first
  const exists = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true }
  });
  if (!exists) throw new NotFoundError('User');

  const user = await prisma.user.update({
    where:  { id: req.params.id },
    data:   req.body,
    select: USER_SELECT,
  });

  res.json({ data: user });
});

// DELETE /users/:id
exports.remove = asyncHandler(async (req, res) => {
  const exists = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true }
  });
  if (!exists) throw new NotFoundError('User');

  await prisma.user.delete({
    where: { id: req.params.id }
  });

  res.status(204).end();
});