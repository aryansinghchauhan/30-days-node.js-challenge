const express      = require('express');
const config       = require('./config');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes       = require('./routes');

const app = express();
app.use(express.json());
app.use(logger);
app.use(`/${config.api.version}`, routes);

app.use((req, res, next) => {
  const { NotFoundError } = require('./errors/AppError');
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

app.use(errorHandler);
module.exports = app;