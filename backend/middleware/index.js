/**
 * Middleware exports
 * Centralized export of all middleware functions
 */

const { 
  validateRequest,
  commonSchemas,
  personSchemas,
  rewardSchemas,
  punishmentSchemas,
  assignmentSchemas
} = require('./validation');

const {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  timeoutHandler,
  mapDatabaseError
} = require('./errorHandler');

const {
  corsOptions,
  devCorsOptions,
  prodCorsOptions,
  getCorsOptions,
  createCorsMiddleware
} = require('./cors');

module.exports = {
  // Validation middleware
  validateRequest,
  commonSchemas,
  personSchemas,
  rewardSchemas,
  punishmentSchemas,
  assignmentSchemas,

  // Error handling
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  timeoutHandler,
  mapDatabaseError,

  // CORS configuration
  corsOptions,
  devCorsOptions,
  prodCorsOptions,
  getCorsOptions,
  createCorsMiddleware
};