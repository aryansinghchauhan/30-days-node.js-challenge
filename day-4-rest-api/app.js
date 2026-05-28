const express      = require('express');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes= require('./routes/products');

const app = express();

app.use(express.json());
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// API v1
app.use('/v1/products', productRoutes);

// 404
app.use((req, res, next) => {
  const err = new Error(`Cannot ${req.method} ${req.path}`);
  err.statusCode = 404;
  err.code = 'ROUTE_NOT_FOUND';
  next(err);
});

app.use(errorHandler);

module.exports = app;