const express  = require('express');
const router   = express.Router();
const pc       = require('../controllers/postController');
const cc       = require('../controllers/commentController');
const validate = require('../middleware/validate');
const {
  createPostSchema,
  updatePostSchema,
  slugParamSchema,
  idParamSchema,
} = require('../schemas/postSchema');
const { createCommentSchema } = require('../schemas/commentSchema');

router.get('/',    pc.getAll);
router.post('/',   validate({ body: createPostSchema }), pc.create);

router.get('/:slug',
  validate({ params: slugParamSchema }), pc.getOne);

router.patch('/:id',
  validate({ params: idParamSchema, body: updatePostSchema }), pc.update);

router.delete('/:id',
  validate({ params: idParamSchema }), pc.remove);

router.post('/:id/publish',
  validate({ params: idParamSchema }), pc.publish);

router.get('/:slug/comments',
  validate({ params: slugParamSchema }), cc.getByPost);

router.post('/:slug/comments',
  validate({ params: slugParamSchema, body: createCommentSchema }), cc.create);

module.exports = router;