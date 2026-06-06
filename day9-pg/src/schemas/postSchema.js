const { z } = require('zod');

const createPostSchema = z.object({
  title:   z.string().trim().min(3).max(255),
  content: z.string().trim().min(10),
  excerpt: z.string().trim().max(500).optional(),
});

const updatePostSchema = createPostSchema.partial();

const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  slugParamSchema,
  idParamSchema,
};