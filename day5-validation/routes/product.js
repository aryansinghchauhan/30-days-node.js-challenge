const express =require('express');
const router =express.Router();
const controller=require('../controllers/productController');
const validate=require('../middleware/validate');
const{
    createProductSchema,
    updateProductSchema,
    getProductQuerySchema,
    idParamSchema
}=require('../schemas/productSchema');
router.get('/',validate({query:getProductQuerySchema}),controller.getAll);
router.get('/:id',validate({params: idParamsSchema}),controller.getOne);
router.post('/',validate({body:createProductSchema}),controller.create);
router.put('/:id',validate({params:idParamSchema,body:createProductSchema}),controller.replace);
router.patch('/:id',validate({params:idParamSchema,body:updateProductSchema}),controller.update);
router.delete('/:id',validate({params:idParamSchema}),controller.remove);
module.exports=router;