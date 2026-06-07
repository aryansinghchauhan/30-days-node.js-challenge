const prisma       = require('../db/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../errors/AppError');

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Reusable post shape for list views
const POST_LIST_SELECT = {
  id:          true,
  title:       true,
  slug:        true,
  excerpt:     true,
  published:   true,
  publishedAt: true,
  createdAt:   true,
  author: {
    select: { id: true, username: true }
  },
  tags: {
    select: { id: true, name: true, slug: true }
  },
  _count: {
    select: { comments: true }
  },
};

// Reusable post shape for detail view
const POST_DETAIL_SELECT = {
  ...POST_LIST_SELECT,
  content: true,
  updatedAt: true,
  author: {
    select: { id: true, username: true, bio: true }
  },
};

// GET /posts
exports.getAll = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const where = { published: true };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select:  POST_LIST_SELECT,
      skip,
      take:    limit,
      orderBy: { publishedAt: 'desc' },
    }),
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

// GET /posts/:slug
exports.getOne = asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({
    where:  { slug: req.params.slug },
    select: POST_DETAIL_SELECT,
  });

  if (!post || !post.published) throw new NotFoundError('Post');
  res.json({ data: post });
});

// POST /posts
exports.create = asyncHandler(async (req, res) => {
  const { title, content, excerpt, tagIds = [] } = req.body;

  let slug = generateSlug(title);

  // Make slug unique if needed
  const slugExists = await prisma.post.findUnique({
    where: { slug }, select: { id: true }
  });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      userId: 1,  // hardcoded — Week 3 uses real auth
      tags: tagIds.length > 0
        ? { connect: tagIds.map(id => ({ id })) }
        : undefined,
    },
    select: POST_DETAIL_SELECT,
  });

  res.status(201).json({ data: post });
});

// PATCH /posts/:id
exports.update = asyncHandler(async (req, res) => {
  const exists = await prisma.post.findUnique({
    where: { id: req.params.id }, select: { id: true }
  });
  if (!exists) throw new NotFoundError('Post');

  const { tagIds, ...rest } = req.body;

  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(tagIds && {
        tags: { set: tagIds.map(id => ({ id })) }
        // set = replace all tags with this new list
      }),
    },
    select: POST_DETAIL_SELECT,
  });

  res.json({ data: post });
});

// POST /posts/:id/publish
exports.publish = asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id }, select: { id: true, published: true }
  });
  if (!post) throw new NotFoundError('Post');

  if (post.published) {
    return res.json({ message: 'Post is already published' });
  }

  const published = await prisma.post.update({
    where: { id: req.params.id },
    data:  { published: true, publishedAt: new Date() },
    select: POST_LIST_SELECT,
  });

  res.json({ data: published, message: 'Post published' });
});

// DELETE /posts/:id
exports.remove = asyncHandler(async (req, res) => {
  const exists = await prisma.post.findUnique({
    where: { id: req.params.id }, select: { id: true }
  });
  if (!exists) throw new NotFoundError('Post');

  await prisma.post.delete({ where: { id: req.params.id } });
  res.status(204).end();
});