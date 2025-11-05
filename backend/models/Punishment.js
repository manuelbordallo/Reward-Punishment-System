const Joi = require('joi');

/**
 * @typedef {Object} Punishment
 * @property {number} id - Unique identifier for the punishment
 * @property {string} name - Name of the punishment
 * @property {number} value - Negative numeric value of the punishment
 * @property {Date} createdAt - Timestamp when the punishment was created
 * @property {Date} updatedAt - Timestamp when the punishment was last updated
 */

/**
 * @typedef {Object} CreatePunishmentRequest
 * @property {string} name - Name of the punishment to create
 * @property {number} value - Negative value of the punishment
 */

/**
 * @typedef {Object} UpdatePunishmentRequest
 * @property {string} name - Updated name of the punishment
 * @property {number} value - Updated negative value of the punishment
 */

/**
 * Joi schema for creating a new punishment
 */
const createPunishmentSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre del castigo no puede estar vacío',
            'string.min': 'El nombre del castigo debe tener al menos 1 carácter',
            'string.max': 'El nombre del castigo no puede exceder 100 caracteres',
            'any.required': 'El nombre del castigo es requerido'
        }),
    value: Joi.number()
        .integer()
        .negative()
        .required()
        .messages({
            'number.base': 'El valor del castigo debe ser un número',
            'number.integer': 'El valor del castigo debe ser un número entero',
            'number.negative': 'El valor del castigo debe ser menor que cero',
            'any.required': 'El valor del castigo es requerido'
        })
});

/**
 * Joi schema for updating an existing punishment
 */
const updatePunishmentSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre del castigo no puede estar vacío',
            'string.min': 'El nombre del castigo debe tener al menos 1 carácter',
            'string.max': 'El nombre del castigo no puede exceder 100 caracteres',
            'any.required': 'El nombre del castigo es requerido'
        }),
    value: Joi.number()
        .integer()
        .negative()
        .required()
        .messages({
            'number.base': 'El valor del castigo debe ser un número',
            'number.integer': 'El valor del castigo debe ser un número entero',
            'number.negative': 'El valor del castigo debe ser menor que cero',
            'any.required': 'El valor del castigo es requerido'
        })
});

/**
 * Joi schema for punishment ID parameter validation
 */
const punishmentIdSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del castigo debe ser un número',
            'number.integer': 'El ID del castigo debe ser un número entero',
            'number.positive': 'El ID del castigo debe ser positivo',
            'any.required': 'El ID del castigo es requerido'
        })
});

module.exports = {
    createPunishmentSchema,
    updatePunishmentSchema,
    punishmentIdSchema
};