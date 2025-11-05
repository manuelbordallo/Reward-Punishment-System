const Joi = require('joi');
const { createValidationErrorResponse, HTTP_STATUS } = require('../models/ApiResponse');

/**
 * Middleware factory for request validation using Joi schemas
 * @param {Object} schema - Joi validation schema object
 * @param {Object} schema.body - Schema for request body
 * @param {Object} schema.params - Schema for request parameters
 * @param {Object} schema.query - Schema for query parameters
 * @returns {Function} Express middleware function
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const validationErrors = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details);
      }
    }

    // Validate request parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details);
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details);
      }
    }

    // If there are validation errors, return error response
    if (validationErrors.length > 0) {
      const validationError = { details: validationErrors };
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createValidationErrorResponse(validationError)
      );
    }

    next();
  };
}

/**
 * Common validation schemas
 */
const commonSchemas = {
  // ID parameter validation
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'ID debe ser un número',
        'number.integer': 'ID debe ser un número entero',
        'number.positive': 'ID debe ser un número positivo',
        'any.required': 'ID es requerido'
      })
  }),

  // Pagination query validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.base': 'Página debe ser un número',
        'number.integer': 'Página debe ser un número entero',
        'number.min': 'Página debe ser mayor a 0'
      }),
    limit: Joi.number().integer().min(1).max(100).default(10)
      .messages({
        'number.base': 'Límite debe ser un número',
        'number.integer': 'Límite debe ser un número entero',
        'number.min': 'Límite debe ser mayor a 0',
        'number.max': 'Límite no puede ser mayor a 100'
      })
  }),

  // Search query validation
  search: Joi.object({
    name: Joi.string().trim().min(1).max(100)
      .messages({
        'string.base': 'Nombre debe ser texto',
        'string.empty': 'Nombre no puede estar vacío',
        'string.min': 'Nombre debe tener al menos 1 carácter',
        'string.max': 'Nombre no puede tener más de 100 caracteres'
      })
  })
};

/**
 * Person validation schemas
 */
const personSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        })
    })
  },
  
  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        })
    })
  },

  getById: {
    params: commonSchemas.idParam
  },

  delete: {
    params: commonSchemas.idParam
  },

  search: {
    query: commonSchemas.search
  },

  checkName: {
    query: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        }),
      excludeId: Joi.number().integer().positive().optional()
        .messages({
          'number.base': 'ID a excluir debe ser un número',
          'number.integer': 'ID a excluir debe ser un número entero',
          'number.positive': 'ID a excluir debe ser un número positivo'
        })
    })
  }
};

/**
 * Reward validation schemas
 */
const rewardSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        }),
      value: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Valor debe ser un número',
          'number.integer': 'Valor debe ser un número entero',
          'number.positive': 'Valor del premio debe ser positivo',
          'any.required': 'Valor es requerido'
        })
    })
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        }),
      value: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Valor debe ser un número',
          'number.integer': 'Valor debe ser un número entero',
          'number.positive': 'Valor del premio debe ser positivo',
          'any.required': 'Valor es requerido'
        })
    })
  },

  getById: {
    params: commonSchemas.idParam
  },

  delete: {
    params: commonSchemas.idParam
  }
};

/**
 * Punishment validation schemas
 */
const punishmentSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        }),
      value: Joi.number().integer().negative().required()
        .messages({
          'number.base': 'Valor debe ser un número',
          'number.integer': 'Valor debe ser un número entero',
          'number.negative': 'Valor del castigo debe ser negativo',
          'any.required': 'Valor es requerido'
        })
    })
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres',
          'any.required': 'Nombre es requerido'
        }),
      value: Joi.number().integer().negative().required()
        .messages({
          'number.base': 'Valor debe ser un número',
          'number.integer': 'Valor debe ser un número entero',
          'number.negative': 'Valor del castigo debe ser negativo',
          'any.required': 'Valor es requerido'
        })
    })
  },

  getById: {
    params: commonSchemas.idParam
  },

  delete: {
    params: commonSchemas.idParam
  }
};

/**
 * Assignment validation schemas
 */
const assignmentSchemas = {
  create: {
    body: Joi.object({
      personIds: Joi.array().items(
        Joi.number().integer().positive().required()
          .messages({
            'number.base': 'ID de persona debe ser un número',
            'number.integer': 'ID de persona debe ser un número entero',
            'number.positive': 'ID de persona debe ser un número positivo',
            'any.required': 'ID de persona es requerido'
          })
      ).min(1).required()
        .messages({
          'array.base': 'IDs de personas debe ser un arreglo',
          'array.min': 'Debe seleccionar al menos una persona',
          'any.required': 'IDs de personas son requeridos'
        }),
      itemType: Joi.string().valid('reward', 'punishment').required()
        .messages({
          'string.base': 'Tipo de elemento debe ser texto',
          'any.only': 'Tipo de elemento debe ser "reward" o "punishment"',
          'any.required': 'Tipo de elemento es requerido'
        }),
      itemId: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'ID de elemento debe ser un número',
          'number.integer': 'ID de elemento debe ser un número entero',
          'number.positive': 'ID de elemento debe ser un número positivo',
          'any.required': 'ID de elemento es requerido'
        })
    })
  },

  delete: {
    params: commonSchemas.idParam
  },

  getByPerson: {
    params: commonSchemas.idParam,
    query: commonSchemas.pagination
  }
};

module.exports = {
  validateRequest,
  commonSchemas,
  personSchemas,
  rewardSchemas,
  punishmentSchemas,
  assignmentSchemas
};