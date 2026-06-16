const Product    = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginate');
const { NotFoundError, BadRequestError } = require('../errors/AppError');

// GET /products — full filtering, sorting, pagination
exports.getAll = asyncHandler(async (req, res) => {
  const {
    search, category, brand, minPrice, maxPrice,
    inStock, tags, minRating, sort = '-createdAt',
  } = req.query;

  const { page, limit, skip } = getPaginationParams(req.query);

  // Build filter
  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category)  filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
  if (brand)     filter.brand    = { $regex: new RegExp(`^${brand}$`, 'i') };

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
  }

  if (inStock !== undefined) filter.inStock = inStock === 'true';
  if (minRating !== undefined) filter.rating = { $gte: parseFloat(minRating) };

  if (tags) {
    const tagList = Array.isArray(tags) ? tags : tags.split(',');
    filter.tags = { $in: tagList.map(t => t.trim().toLowerCase()) };
  }

  // Validate sort
  const allowedSorts = [
    'price', '-price', 'rating', '-rating',
    'name', '-name', 'createdAt', '-createdAt',
    'viewCount', '-viewCount',
  ];
  const safeSort = allowedSorts.includes(sort) ? sort : '-createdAt';

  // Build sort object for text search (add relevance score)
  const sortObj = search
    ? { score: { $meta: 'textScore' }, ...parseSortString(safeSort) }
    : parseSortString(safeSort);

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter, search ? { score: { $meta: 'textScore' } } : {})
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('name price category brand rating reviewCount inStock stock discount tags salePrice'),
  ]);

  res.json({
    data: products,
    pagination: buildPaginationMeta(total, page, limit),
    appliedFilters: {
      search:    search    || null,
      category:  category  || null,
      brand:     brand     || null,
      priceRange: (minPrice || maxPrice)
        ? { min: minPrice || null, max: maxPrice || null }
        : null,
      inStock:   inStock   !== undefined ? inStock === 'true' : null,
      minRating: minRating || null,
      tags:      tags      || null,
    },
  });
});

// Helper: parse '-price' or 'price' into { price: -1 } or { price: 1 }
function parseSortString(sort) {
  if (sort.startsWith('-')) {
    return { [sort.slice(1)]: -1 };
  }
  return { [sort]: 1 };
}

// GET /products/stats — aggregation dashboard
exports.getStats = asyncHandler(async (req, res) => {
  const [
    overview,
    byCategory,
    byBrand,
    priceDistribution,
    topRated,
    recentlyAdded,
  ] = await Promise.all([

    // Overview numbers
    Product.aggregate([
      {
        $group: {
          _id:          null,
          totalProducts:{ $sum: 1 },
          totalInStock: { $sum: { $cond: ['$inStock', 1, 0] } },
          avgPrice:     { $avg: '$price' },
          minPrice:     { $min: '$price' },
          maxPrice:     { $max: '$price' },
          avgRating:    { $avg: '$rating' },
          totalViews:   { $sum: '$viewCount' },
          totalReviews: { $sum: '$reviewCount' },
        }
      },
      {
        $project: {
          _id:          0,
          totalProducts:1,
          totalInStock: 1,
          outOfStock:   { $subtract: ['$totalProducts', '$totalInStock'] },
          avgPrice:     { $round: ['$avgPrice', 2] },
          minPrice:     1,
          maxPrice:     1,
          avgRating:    { $round: ['$avgRating', 1] },
          totalViews:   1,
          totalReviews: 1,
        }
      }
    ]),

    // Products per category with avg price
    Product.aggregate([
      {
        $group: {
          _id:      '$category',
          count:    { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating:{ $avg: '$rating' },
          inStock:  { $sum: { $cond: ['$inStock', 1, 0] } },
        }
      },
      {
        $project: {
          category:  '$_id',
          count:     1,
          avgPrice:  { $round: ['$avgPrice', 2] },
          avgRating: { $round: ['$avgRating', 1] },
          inStock:   1,
          _id:       0,
        }
      },
      { $sort: { count: -1 } },
    ]),

    // Top 5 brands by product count
    Product.aggregate([
      { $match: { brand: { $exists: true, $ne: null } } },
      {
        $group: {
          _id:   '$brand',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          brand:     '$_id',
          count:     1,
          avgRating: { $round: ['$avgRating', 1] },
          _id:       0,
        }
      },
    ]),

    // Price distribution buckets
    Product.aggregate([
      {
        $bucket: {
          groupBy:    '$price',
          boundaries: [0, 500, 1000, 2500, 5000, 10000, 50000],
          default:    '50000+',
          output: {
            count:    { $sum: 1 },
            avgPrice: { $avg: '$price' },
          }
        }
      }
    ]),

    // Top 5 rated products
    Product.find({ reviewCount: { $gte: 1 } })
      .sort('-rating -reviewCount')
      .limit(5)
      .select('name price category rating reviewCount'),

    // Last 5 added
    Product.find()
      .sort('-createdAt')
      .limit(5)
      .select('name price category createdAt'),
  ]);

  res.json({
    data: {
      overview:          overview[0] || {},
      byCategory,
      topBrands:         byBrand,
      priceDistribution,
      topRated,
      recentlyAdded,
    }
  });
});

// GET /products/:id
exports.getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new NotFoundError('Product');

  product.viewCount += 1;
  await product.save();

  res.json({ data: product });
});

// POST /products
exports.create = asyncHandler(async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.entries(err.errors).reduce((acc, [k, v]) => {
        acc[k] = v.message; return acc;
      }, {});
      return res.status(400).json({
        error: { message: 'Validation failed', code: 'VALIDATION_ERROR', fields }
      });
    }
    throw err;
  }
});

// PATCH /products/:id
exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!product) throw new NotFoundError('Product');
  res.json({ data: product });
});

// DELETE /products/:id
exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new NotFoundError('Product');
  res.status(204).end();
});

// POST /products/:id/reviews
exports.addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new NotFoundError('Product');

  const { rating, comment, author } = req.body;

  product.reviews.push({ rating, comment, author });
  product.updateRating();
  await product.save();

  res.status(201).json({
    data:    product.reviews[product.reviews.length - 1],
    message: `Rating updated to ${product.rating}`,
  });
});

// GET /products/cursor — cursor-based pagination demo
exports.getCursor = asyncHandler(async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit) || 10, 50);
  const cursor = req.query.cursor || null;
  const filter = {};

  if (cursor) {
    const { Types } = require('mongoose');
    try {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    } catch {
      throw new BadRequestError('Invalid cursor');
    }
  }

  const products = await Product.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .select('name price category rating createdAt');

  const hasNextPage = products.length > limit;
  const items       = hasNextPage ? products.slice(0, limit) : products;

  res.json({
    data: items,
    pagination: {
      limit,
      hasNextPage,
      nextCursor: hasNextPage
        ? items[items.length - 1]._id.toString()
        : null,
    },
  });
});