class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name          = this.constructor.name;
    this.statusCode    = statusCode;
    this.code          = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400, 'BAD_REQUEST');
  }
}

function handleDbError(err) {
  if (err.code === '23505') {
    const field = err.detail?.match(/Key \((.+?)\)/)?.[1] || 'field';
    return new ConflictError(`${field} already exists`);
  }
  if (err.code === '23503') {
    return new BadRequestError('Referenced resource does not exist');
  }
  if (err.code === '23502') {
    return new BadRequestError(`${err.column} is required`);
  }
  if (err.code === '22P02') {
    return new BadRequestError('Invalid data format');
  }
  return err;
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  BadRequestError,
  handleDbError,
};