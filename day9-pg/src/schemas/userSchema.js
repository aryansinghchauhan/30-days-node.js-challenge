const { z } = require('zod');

const createUserSchema = z.object({
  username: z.string().trim().min(3).max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'only letters, numbers, underscores allowed'),
  email: z.string().email().toLowerCase(),
  bio:   z.string().trim().max(500).optional(),
});

const updateUserSchema = createUserSchema.partial();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { createUserSchema, updateUserSchema, idParamSchema };