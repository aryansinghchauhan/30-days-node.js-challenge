const express      = require('express');
const config       = require('./config');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes       = require('./routes');

const app = express();

// Global middleware
app.use(express.json());
app.use(logger);

// All routes under /v1
app.use(`/${config.api.version}`, routes);

// 404 handler
app.use((req, res, next) => {
  const { NotFoundError } = require('./errors/AppError');
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// Error handler — always last
app.use(errorHandler);

module.exports = app;