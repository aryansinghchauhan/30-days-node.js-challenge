const { z }=require('zod');
const COLORS =['white','yellow','blue','green','pink'];

const createNoteSchema=z.object({
    title: z
      .string({required_error:'title is required'})
      .trim()
      .min(1,'title cannot be empty')
      .max(200,'title cannot exceed 200 characters'),
    content: z
      .string()
      .trim()
      .max(10000,'content cannot exceed 10000 characters')
      .default(''),
    tags: z
      .array(
        z.string()
         .trim()
         .toLowerCase()
         .min(1,'tag cannot be empty')
         .max(30,'tag cannot exceed 30 characters')
      )
      .max(10,'cannot have more than 10 tags')
      .default([])
      .transform(tags=>[...new Set(tags)]),
    isPinned:z.boolean().default(false),
    isArchived:z.boolean().default(false),

    color:z
      .enum(COLORS, {
        errorMap: () => ({message:`color must be onr of : ${COLORS.join('.')}`})
      })
      .default('white'),


});
const updateNoteSchema=createNoteSchema.partial();
const getNotesQuerySchema=z.object({
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['id','title','createdAt','updatedAt']).default('createdAt'),
  order: z.enum(['asc','desc']).default('desc'),
  search: z.string().trim().optional(),
  tag: z.string().trim().toLowerCase().optional(),
  isPinned:   z.enum(['true', 'false']).optional(),
  isArchived: z.enum(['true', 'false']).optional(),
  color:      z.enum(COLORS).optional(),

})
const idParamSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: 'id must be a number',
  }).int().positive('id must be a positive integer'),
});
module.exports = {
  createNoteSchema,
  updateNoteSchema,
  getNotesQuerySchema,
  idParamSchema,
  COLORS,
};
