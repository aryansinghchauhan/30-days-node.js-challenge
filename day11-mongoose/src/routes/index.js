const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const users    = require('./users');
const posts    = require('./posts');
const tags     = require('./tags');

router.get('/health', (req, res) => {
  const dbState = ['disconnected','connected','connecting','disconnecting'];
  res.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
    db:     dbState[mongoose.connection.readyState],
    uptime: `${Math.floor(process.uptime())}s`,
    time:   new Date().toISOString(),
  });
});

router.use('/users', users);
router.use('/posts', posts);
router.use('/tags',  tags);

module.exports = router;