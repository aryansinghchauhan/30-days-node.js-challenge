const express=require('express');
const router=express.Router();
const config=require('../config');
const products=require('../products');
router.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    env:     config.nodeEnv,
    uptime:  Math.floor(process.uptime()),
    time:    new Date().toISOString(),
  });
});

router.use('/products', products);

module.exports = router;