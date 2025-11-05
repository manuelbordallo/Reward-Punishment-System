// Person model and validation schemas
const {
  createPersonSchema,
  updatePersonSchema,
  personIdSchema
} = require('./Person');

// Reward model and validation schemas
const {
  createRewardSchema,
  updateRewardSchema,
  rewardIdSchema
} = require('./Reward');

// Punishment model and validation schemas
const {
  createPunishmentSchema,
  updatePunishmentSchema,
  punishmentIdSchema
} = require('./Punishment');

// Assignment model and validation schemas
const {
  createAssignmentSchema,
  assignmentIdSchema,
  personScoreIdSchema
} = require('./Assignment');

// API response utilities and error handling
const {
  ERROR_CODES,
  HTTP_STATUS,
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createAlreadyExistsErrorResponse,
  createDatabaseErrorResponse
} = require('./ApiResponse');

module.exports = {
  // Person schemas
  createPersonSchema,
  updatePersonSchema,
  personIdSchema,
  
  // Reward schemas
  createRewardSchema,
  updateRewardSchema,
  rewardIdSchema,
  
  // Punishment schemas
  createPunishmentSchema,
  updatePunishmentSchema,
  punishmentIdSchema,
  
  // Assignment schemas
  createAssignmentSchema,
  assignmentIdSchema,
  personScoreIdSchema,
  
  // API response utilities
  ERROR_CODES,
  HTTP_STATUS,
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createAlreadyExistsErrorResponse,
  createDatabaseErrorResponse
};const Action = require('./Action');

module.exports = {
  Person,
  Reward,
  Punishment,
  Action,
  Assignment,
  ApiResponse
};
