const { z } = require('zod');
const createTagSchema = z.object({
  name: z.string().trim().min(2).max(50),
});
const slugParamSchema = z.object({ slug: z.string().trim().min(1) });
module.exports = { createTagSchema, slugParamSchema };