const express      = require('express');
const config       = require('./config');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes       = require('./routes');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Log every request
app.use(logger);

// All API routes under /v1
app.use(`/${config.api.version}`, routes);

// 404 — no route matched
app.use((req, res, next) => {
  const { NotFoundError } = require('./errors/AppError');
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// Error handler — must be last
app.use(errorHandler);

module.exports = app;