const { z } = require('zod');

const createUserSchema = z.object({
  username: z.string().trim().min(3).max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'only letters, numbers, underscores'),
  email: z.string().email().toLowerCase(),
  bio:   z.string().trim().max(500).optional(),
});

const updateUserSchema = createUserSchema.partial();

const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});

module.exports = { createUserSchema, updateUserSchema, mongoIdSchema };