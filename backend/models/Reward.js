const Joi = require('joi');

/**
 * @typedef {Object} Reward
 * @property {number} id - Unique identifier for the reward
 * @property {string} name - Name of the reward
 * @property {number} value - Positive numeric value of the reward
 * @property {Date} createdAt - Timestamp when the reward was created
 * @property {Date} updatedAt - Timestamp when the reward was last updated
 */

/**
 * @typedef {Object} CreateRewardRequest
 * @property {string} name - Name of the reward to create
 * @property {number} value - Positive value of the reward
 */

/**
 * @typedef {Object} UpdateRewardRequest
 * @property {string} name - Updated name of the reward
 * @property {number} value - Updated positive value of the reward
 */

/**
 * Joi schema for creating a new reward
 */
const createRewardSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre del premio no puede estar vacío',
      'string.min': 'El nombre del premio debe tener al menos 1 carácter',
      'string.max': 'El nombre del premio no puede exceder 100 caracteres',
      'any.required': 'El nombre del premio es requerido'
    }),
  value: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El valor del premio debe ser un número',
      'number.integer': 'El valor del premio debe ser un número entero',
      'number.positive': 'El valor del premio debe ser mayor que cero',
      'any.required': 'El valor del premio es requerido'
    })
});

/**
 * Joi schema for updating an existing reward
 */
const updateRewardSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre del premio no puede estar vacío',
      'string.min': 'El nombre del premio debe tener al menos 1 carácter',
      'string.max': 'El nombre del premio no puede exceder 100 caracteres',
      'any.required': 'El nombre del premio es requerido'
    }),
  value: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El valor del premio debe ser un número',
      'number.integer': 'El valor del premio debe ser un número entero',
      'number.positive': 'El valor del premio debe ser mayor que cero',
      'any.required': 'El valor del premio es requerido'
    })
});

/**
 * Joi schema for reward ID parameter validation
 */
const rewardIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del premio debe ser un número',
      'number.integer': 'El ID del premio debe ser un número entero',
      'number.positive': 'El ID del premio debe ser positivo',
      'any.required': 'El ID del premio es requerido'
    })
});

module.exports = {
  createRewardSchema,
  updateRewardSchema,
  rewardIdSchema
};