const express  = require('express');
const router   = express.Router();
const c        = require('../controllers/tagController');
const validate = require('../middleware/validate');
const { createTagSchema, slugParamSchema } = require('../schemas/tagSchema');

router.get('/',            c.getAll);
router.post('/',           validate({ body: createTagSchema }), c.create);
router.get('/:slug/posts', validate({ params: slugParamSchema }), c.getPostsByTag);

module.exports = router;