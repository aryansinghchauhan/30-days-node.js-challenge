const express  = require('express');
const router   = express.Router();
const c        = require('../controllers/userController');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema, mongoIdSchema } = require('../schemas/userSchema');

router.get('/',      c.getAll);
router.get('/:id',   validate({ params: mongoIdSchema }), c.getOne);
router.post('/',     validate({ body: createUserSchema }), c.create);
router.patch('/:id', validate({ params: mongoIdSchema, body: updateUserSchema }), c.update);
router.delete('/:id',validate({ params: mongoIdSchema }), c.remove);

module.exports = router;