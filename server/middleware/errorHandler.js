const ApiError = require('../utils/ApiError');

/**
 * Catches unknown routes and forwards a 404 ApiError into the error handler.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

/**
 * Central error handler. Normalizes Mongoose/JWT/Multer errors into a clean
 * JSON shape and never leaks stack traces or internals in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again.';
  let details = err.details || null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use` : 'Duplicate value';
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  }

  if (!err.isOperational && process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
