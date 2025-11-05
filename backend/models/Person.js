const Joi = require('joi');

/**
 * @typedef {Object} Person
 * @property {number} id - Unique identifier for the person
 * @property {string} name - Name of the person (must be unique and non-empty)
 * @property {Date} createdAt - Timestamp when the person was created
 * @property {Date} updatedAt - Timestamp when the person was last updated
 */

/**
 * @typedef {Object} CreatePersonRequest
 * @property {string} name - Name of the person to create
 */

/**
 * @typedef {Object} UpdatePersonRequest
 * @property {string} name - Updated name of the person
 */

/**
 * Joi schema for creating a new person
 */
const createPersonSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre de la persona no puede estar vacío',
            'string.min': 'El nombre de la persona debe tener al menos 1 carácter',
            'string.max': 'El nombre de la persona no puede exceder 100 caracteres',
            'any.required': 'El nombre de la persona es requerido'
        })
});

/**
 * Joi schema for updating an existing person
 */
const updatePersonSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre de la persona no puede estar vacío',
            'string.min': 'El nombre de la persona debe tener al menos 1 carácter',
            'string.max': 'El nombre de la persona no puede exceder 100 caracteres',
            'any.required': 'El nombre de la persona es requerido'
        })
});

/**
 * Joi schema for person ID parameter validation
 */
const personIdSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID de la persona debe ser un número',
            'number.integer': 'El ID de la persona debe ser un número entero',
            'number.positive': 'El ID de la persona debe ser positivo',
            'any.required': 'El ID de la persona es requerido'
        })
});

module.exports = {
    createPersonSchema,
    updatePersonSchema,
    personIdSchema
};