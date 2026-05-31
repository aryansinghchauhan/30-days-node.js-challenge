const {z}=require('zod');
const createProductSchema=z.object({// a object to validate input
    name: z.string({required_error:'name is required'}).trim().min(2,'name must be atleast 2 characters').max(100,'name must be at most 100 character'),
    category:z.string({required_error:'category is required'}).trim().toLowerCase().min(2,'category must be atleast 2 character'),
    prize:z.number({required_error:'price is required', invalid_type_error:'price must be a number'}).nonnegative('price cannot be negative').max(1000000,'price cannot be unnecessarily high'),
    inStock:z.boolean().default(true),
    tags:z.array(z.string().trim().min(1)).max(10,'maximum 10 tags allowed').default([]),
})
const updateProductSchema=createProductSchema.partial();//makes every fiels optional
const getProductQuerySchema=z.object({
    page: z.coerce.number().int().positive().default(1),
    sort:z.enum(['id','name','price','createdAt']).dafault('id'),
    inStock=z.enum(['true','false']).optional(),
    minPrice:z.coerce.number().nonnegative().optional(),
    maxPrice=z.coerce.number().nonnegative().optional(),

}).refine(
    data => {
        if(data.minPrice!== undefined && data.maxPrice!==undefined){
            return data.maxPrice>=data.minPrice;
        }
        return true;
    },{message:'maxPrice must be >=minPrice',path:['MaxPrice']}
)
const idParamSchema=z.object({
    id:z.coerce.number({
        invalid_type_error:'id must be number'

    }).int().positive('id must be a positive number'),
});