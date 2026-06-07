const express  = require('express');
const router   = express.Router();
const prisma   = require('../db/prisma');
const users    = require('./users');
const posts    = require('./posts');
const tags     = require('./tags');

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'disconnected' });
  }
});

router.use('/users', users);
router.use('/posts', posts);
router.use('/tags',  tags);

module.exports = router;