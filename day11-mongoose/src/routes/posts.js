const express  = require('express');
const router   = express.Router();
const pc       = require('../controllers/postController');
const validate = require('../middleware/validate');
const { createPostSchema, updatePostSchema, slugParamSchema, mongoIdSchema } = require('../schemas/postSchema');
const { createCommentSchema } = require('../schemas/commentSchema');

router.get('/',    pc.getAll);
router.post('/',   validate({ body: createPostSchema }), pc.create);

router.get('/:slug',          validate({ params: slugParamSchema }), pc.getOne);
router.patch('/:id',          validate({ params: mongoIdSchema, body: updatePostSchema }), pc.update);
router.delete('/:id',         validate({ params: mongoIdSchema }), pc.remove);
router.post('/:id/publish',   validate({ params: mongoIdSchema }), pc.publish);
router.post('/:slug/comments',validate({ params: slugParamSchema, body: createCommentSchema }), pc.addComment);
router.delete('/:postId/comments/:commentId', pc.removeComment);

module.exports = router;