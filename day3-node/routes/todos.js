const express=require('express');
const router=express.Router();
const todo=require('../controllers/todoController');
router.get('/',todo.getAll);
router.get('/:id',todo.getOne);
router.post('/',todo.create);
router.patch('/:id',todo.update);
router.delete('/:id',todo.remove);

module.exports=router;