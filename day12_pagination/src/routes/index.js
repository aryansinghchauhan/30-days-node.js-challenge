const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const products = require('./products');

router.get('/health', (req, res) => {
  const state = ['disconnected','connected','connecting','disconnecting'];
  res.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
    db:     state[mongoose.connection.readyState],
    uptime: `${Math.floor(process.uptime())}s`,
    time:   new Date().toISOString(),
  });
});

router.use('/products', products);
module.exports = router;