const { z } = require('zod');

const createProductSchema = z.object({
  name:        z.string().trim().min(2).max(200),
  description: z.string().trim().min(5),
  price:       z.number().nonnegative(),
  category:    z.string().trim().toLowerCase(),
  brand:       z.string().trim().toLowerCase().optional(),
  tags:        z.array(z.string().trim().toLowerCase()).default([]),
  inStock:     z.boolean().default(true),
  stock:       z.number().int().nonnegative().default(0),
  discount:    z.number().min(0).max(100).default(0),
});

const updateProductSchema = createProductSchema.partial();

const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  author:  z.string().trim().min(1),
});

const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});

const querySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().positive().max(100).default(10),
  sort:      z.string().optional(),
  search:    z.string().trim().optional(),
  category:  z.string().trim().optional(),
  brand:     z.string().trim().optional(),
  minPrice:  z.coerce.number().nonnegative().optional(),
  maxPrice:  z.coerce.number().nonnegative().optional(),
  inStock:   z.enum(['true', 'false']).optional(),
  tags:      z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
}).refine(
  d => !(d.minPrice !== undefined && d.maxPrice !== undefined && d.maxPrice < d.minPrice),
  { message: 'maxPrice must be >= minPrice', path: ['maxPrice'] }
);

module.exports = {
  createProductSchema, updateProductSchema,
  reviewSchema, mongoIdSchema, querySchema,
};