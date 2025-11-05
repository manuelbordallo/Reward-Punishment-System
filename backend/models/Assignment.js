const Joi = require('joi');

/**
 * @typedef {Object} Assignment
 * @property {number} id - Unique identifier for the assignment
 * @property {number} personId - ID of the person receiving the assignment
 * @property {'reward'|'punishment'} itemType - Type of item being assigned
 * @property {number} itemId - ID of the reward or punishment being assigned
 * @property {string} itemName - Name of the reward or punishment (cached for performance)
 * @property {number} itemValue - Value of the reward or punishment (cached for performance)
 * @property {Date} assignedAt - Timestamp when the assignment was made
 */

/**
 * @typedef {Object} CreateAssignmentRequest
 * @property {number[]} personIds - Array of person IDs to assign the item to
 * @property {'reward'|'punishment'} itemType - Type of item being assigned
 * @property {number} itemId - ID of the reward or punishment being assigned
 */

/**
 * @typedef {Object} PersonScore
 * @property {number} personId - ID of the person
 * @property {string} personName - Name of the person
 * @property {number} totalScore - Total accumulated score
 * @property {number} weeklyScore - Score for the current week
 * @property {number} assignmentCount - Total number of assignments
 */

/**
 * Joi schema for creating a new assignment
 */
const createAssignmentSchema = Joi.object({
    personIds: Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
                .required()
        )
        .min(1)
        .required()
        .messages({
            'array.base': 'Los IDs de personas deben ser un arreglo',
            'array.min': 'Debe seleccionar al menos una persona',
            'any.required': 'Los IDs de personas son requeridos'
        }),
    itemType: Joi.string()
        .valid('reward', 'punishment')
        .required()
        .messages({
            'any.only': 'El tipo de elemento debe ser "reward" o "punishment"',
            'any.required': 'El tipo de elemento es requerido'
        }),
    itemId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del elemento debe ser un número',
            'number.integer': 'El ID del elemento debe ser un número entero',
            'number.positive': 'El ID del elemento debe ser positivo',
            'any.required': 'El ID del elemento es requerido'
        })
});

/**
 * Joi schema for assignment ID parameter validation
 */
const assignmentIdSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID de la asignación debe ser un número',
            'number.integer': 'El ID de la asignación debe ser un número entero',
            'number.positive': 'El ID de la asignación debe ser positivo',
            'any.required': 'El ID de la asignación es requerido'
        })
});

/**
 * Joi schema for person ID parameter validation in score queries
 */
const personScoreIdSchema = Joi.object({
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
    createAssignmentSchema,
    assignmentIdSchema,
    personScoreIdSchema
};