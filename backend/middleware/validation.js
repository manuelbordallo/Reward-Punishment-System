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
 * Action validation schemas
 */
const actionSchemas = {
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
      value: Joi.number().integer().not(0).required()
        .messages({
          'number.base': 'Valor debe ser un número',
          'number.integer': 'Valor debe ser un número entero',
          'any.invalid': 'Valor no puede ser cero',
          'any.required': 'Valor es requerido'
        }),
      type: Joi.string().valid('positive', 'negative').required()
        .messages({
          'string.base': 'Tipo debe ser texto',
          'any.only': 'Tipo debe ser "positive" o "negative"',
          'any.required': 'Tipo es requerido'
        })
    }).custom((value, helpers) => {
      // Custom validation: positive type must have positive value, negative type must have negative value
      if (value.type === 'positive' && value.value <= 0) {
        return helpers.error('custom.positiveValue');
      }
      if (value.type === 'negative' && value.value >= 0) {
        return helpers.error('custom.negativeValue');
      }
      return value;
    }).messages({
      'custom.positiveValue': 'Las acciones positivas deben tener valores positivos',
      'custom.negativeValue': 'Las acciones negativas deben tener valores negativos'
    })
  },

  update: {
    params: commonSchemas.idParam,
    body: Joi.object({
      name: Joi.string().trim().min(1).max(100).optional()
        .messages({
          'string.base': 'Nombre debe ser texto',
          'string.empty': 'Nombre no puede estar vacío',
          'string.min': 'Nombre debe tener al menos 1 carácter',
          'string.max': 'Nombre no puede tener más de 100 caracteres'
        }),
      value: Joi.number().integer().not(0).optional()
        .messages({
          'number.base': 'Valor debe ser un número',
          'number.integer': 'Valor debe ser un número entero',
          'any.invalid': 'Valor no puede ser cero'
        }),
      type: Joi.string().valid('positive', 'negative').optional()
        .messages({
          'string.base': 'Tipo debe ser texto',
          'any.only': 'Tipo debe ser "positive" o "negative"'
        })
    }).custom((value, helpers) => {
      // Custom validation for consistency between type and value
      if (value.type && value.value !== undefined) {
        if (value.type === 'positive' && value.value <= 0) {
          return helpers.error('custom.positiveValue');
        }
        if (value.type === 'negative' && value.value >= 0) {
          return helpers.error('custom.negativeValue');
        }
      }
      return value;
    }).messages({
      'custom.positiveValue': 'Las acciones positivas deben tener valores positivos',
      'custom.negativeValue': 'Las acciones negativas deben tener valores negativos'
    })
  },

  getById: {
    params: commonSchemas.idParam
  },

  delete: {
    params: commonSchemas.idParam
  },

  search: {
    query: Joi.object({
      q: Joi.string().trim().min(1).max(100).required()
        .messages({
          'string.base': 'Término de búsqueda debe ser texto',
          'string.empty': 'Término de búsqueda no puede estar vacío',
          'string.min': 'Término de búsqueda debe tener al menos 1 carácter',
          'string.max': 'Término de búsqueda no puede tener más de 100 caracteres',
          'any.required': 'Término de búsqueda es requerido'
        })
    })
  },

  filter: {
    query: Joi.object({
      type: Joi.string().valid('positive', 'negative').optional()
        .messages({
          'string.base': 'Tipo debe ser texto',
          'any.only': 'Tipo debe ser "positive" o "negative"'
        }),
      minValue: Joi.number().integer().optional()
        .messages({
          'number.base': 'Valor mínimo debe ser un número',
          'number.integer': 'Valor mínimo debe ser un número entero'
        }),
      maxValue: Joi.number().integer().optional()
        .messages({
          'number.base': 'Valor máximo debe ser un número',
          'number.integer': 'Valor máximo debe ser un número entero'
        })
    })
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
      // Updated to support both legacy and new action system
      itemType: Joi.string().valid('reward', 'punishment', 'action').required()
        .messages({
          'string.base': 'Tipo de elemento debe ser texto',
          'any.only': 'Tipo de elemento debe ser "reward", "punishment" o "action"',
          'any.required': 'Tipo de elemento es requerido'
        }),
      itemId: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'ID de elemento debe ser un número',
          'number.integer': 'ID de elemento debe ser un número entero',
          'number.positive': 'ID de elemento debe ser un número positivo',
          'any.required': 'ID de elemento es requerido'
        }),
      // New field for action-based assignments
      actionId: Joi.number().integer().positive().optional()
        .messages({
          'number.base': 'ID de acción debe ser un número',
          'number.integer': 'ID de acción debe ser un número entero',
          'number.positive': 'ID de acción debe ser un número positivo'
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

// Validation middleware functions
const validatePerson = validateRequest(personSchemas.create);
const validatePersonUpdate = validateRequest(personSchemas.update);
const validateReward = validateRequest(rewardSchemas.create);
const validateRewardUpdate = validateRequest(rewardSchemas.update);
const validatePunishment = validateRequest(punishmentSchemas.create);
const validatePunishmentUpdate = validateRequest(punishmentSchemas.update);
const validateAction = validateRequest(actionSchemas.create);
const validateActionUpdate = validateRequest(actionSchemas.update);
const validateAssignment = validateRequest(assignmentSchemas.create);

module.exports = {
  validateRequest,
  commonSchemas,
  personSchemas,
  rewardSchemas,
  punishmentSchemas,
  actionSchemas,
  assignmentSchemas,
  // Middleware functions
  validatePerson,
  validatePersonUpdate,
  validateReward,
  validateRewardUpdate,
  validatePunishment,
  validatePunishmentUpdate,
  validateAction,
  validateActionUpdate,
  validateAssignment
};