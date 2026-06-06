const express  = require('express');
const router   = express.Router();
const c        = require('../controllers/userController');
const validate = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} = require('../schemas/userSchema');

router.get('/',      c.getAll);
router.get('/:id',   validate({ params: idParamSchema }), c.getOne);
router.post('/',     validate({ body: createUserSchema }), c.create);
router.patch('/:id', validate({ params: idParamSchema, body: updateUserSchema }), c.update);
router.delete('/:id',validate({ params: idParamSchema }), c.remove);

module.exports = router;