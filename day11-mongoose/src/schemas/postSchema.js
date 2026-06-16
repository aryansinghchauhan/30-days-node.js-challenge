const { z } = require('zod');

const createPostSchema = z.object({
  title:   z.string().trim().min(3).max(255),
  content: z.string().trim().min(10),
  excerpt: z.string().trim().max(500).optional(),
  tagIds:  z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tag ID')
  ).default([]),
});

const updatePostSchema = createPostSchema.partial();
const slugParamSchema  = z.object({ slug: z.string().trim().min(1) });
const mongoIdSchema    = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});

module.exports = { createPostSchema, updatePostSchema, slugParamSchema, mongoIdSchema };