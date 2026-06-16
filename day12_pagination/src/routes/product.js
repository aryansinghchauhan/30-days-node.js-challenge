const express  = require('express');
const router   = express.Router();
const c        = require('../controllers/productController');
const validate = require('../middleware/validate');
const {
  createProductSchema, updateProductSchema,
  reviewSchema, mongoIdSchema, querySchema,
} = require('../schemas/productSchema');

router.get('/stats',   c.getStats);
router.get('/cursor',  c.getCursor);

router.get('/',
  validate({ query: querySchema }),
  c.getAll
);

router.post('/',
  validate({ body: createProductSchema }),
  c.create
);

router.get('/:id',
  validate({ params: mongoIdSchema }),
  c.getOne
);

router.patch('/:id',
  validate({ params: mongoIdSchema, body: updateProductSchema }),
  c.update
);

router.delete('/:id',
  validate({ params: mongoIdSchema }),
  c.remove
);

router.post('/:id/reviews',
  validate({ params: mongoIdSchema, body: reviewSchema }),
  c.addReview
);

module.exports = router;