/**
 * Shared error handler middleware
 * Provides consistent error JSON shape across all routes.
 */

/**
 * Standard error response shape
 * @typedef {Object} ErrorResponse
 * @property {boolean} ok - Always false for errors
 * @property {string} error - Human-readable error message
 * @property {string} [code] - Error code for client handling
 * @property {Object} [details] - Additional error details (dev only)
 */

/**
 * Custom API error class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
}

/**
 * Validation error helper
 */
class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Not found error helper
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized error helper
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden error helper
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error(`[Error] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Build response
  const response = {
    ok: false,
    error: err.message || 'An unexpected error occurred',
    code: err.code || 'INTERNAL_ERROR'
  };

  // Include details in development
  if (process.env.NODE_ENV !== 'production' && err.details) {
    response.details = err.details;
  }

  // Include stack trace in development for 500 errors
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
}

/**
 * Async handler wrapper to catch promise rejections
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};

