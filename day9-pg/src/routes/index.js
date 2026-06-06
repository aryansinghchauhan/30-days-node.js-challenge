const express = require('express');
const router  = express.Router();
const db      = require('../db');
const users   = require('./users');
const posts   = require('./posts');

router.get('/health', async (req, res) => {
  const dbOk = await db.checkConnection().catch(() => false);
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    db:     dbOk ? 'connected' : 'disconnected',
    uptime: `${Math.floor(process.uptime())}s`,
    time:   new Date().toISOString(),
  });
});

router.use('/users', users);
router.use('/posts', posts);

module.exports = router;