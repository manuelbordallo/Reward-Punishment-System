/**
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for successful responses
 * @property {*} data - The response data
 * @property {string} [message] - Optional success message
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {ErrorDetails} error - Error details object
 */

/**
 * @typedef {Object} ErrorDetails
 * @property {string} code - Error code for programmatic handling
 * @property {string} message - Human-readable error message
 * @property {*} [details] - Optional additional error details
 * @property {string} [field] - Field name for validation errors
 */

/**
 * @typedef {Object} ValidationErrorDetails
 * @property {string} code - Always 'VALIDATION_ERROR'
 * @property {string} message - Validation error message
 * @property {ValidationFieldError[]} details - Array of field-specific errors
 */

/**
 * @typedef {Object} ValidationFieldError
 * @property {string} field - Name of the field with validation error
 * @property {string} message - Field-specific error message
 * @property {*} value - The invalid value that was provided
 */

/**
 * Error codes used throughout the application
 */
const ERROR_CODES = {
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    // Resource errors
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

    // Database errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

    // Business logic errors
    INVALID_OPERATION: 'INVALID_OPERATION',
    BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',

    // Server errors
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * HTTP status codes used in the application
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

/**
 * Creates a standardized success response
 * @param {*} data - The response data
 * @param {string} [message] - Optional success message
 * @returns {SuccessResponse}
 */
function createSuccessResponse(data, message = null) {
    const response = {
        success: true,
        data
    };

    if (message) {
        response.message = message;
    }

    return response;
}

/**
 * Creates a standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {*} [details] - Optional error details
 * @param {string} [field] - Optional field name for validation errors
 * @returns {ErrorResponse}
 */
function createErrorResponse(code, message, details = null, field = null) {
    const error = {
        code,
        message
    };

    if (details !== null) {
        error.details = details;
    }

    if (field) {
        error.field = field;
    }

    return {
        success: false,
        error
    };
}

/**
 * Creates a validation error response from Joi validation result
 * @param {Object} validationError - Joi validation error object
 * @returns {ErrorResponse}
 */
function createValidationErrorResponse(validationError) {
    const details = validationError.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
    }));

    return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Error de validación en los datos proporcionados',
        details
    );
}

/**
 * Creates a resource not found error response
 * @param {string} resourceType - Type of resource (e.g., 'persona', 'premio')
 * @param {number|string} resourceId - ID of the resource
 * @returns {ErrorResponse}
 */
function createNotFoundErrorResponse(resourceType, resourceId) {
    return createErrorResponse(
        ERROR_CODES.RESOURCE_NOT_FOUND,
        `${resourceType} con ID ${resourceId} no encontrado`
    );
}

/**
 * Creates a resource already exists error response
 * @param {string} resourceType - Type of resource
 * @param {string} field - Field that already exists
 * @param {*} value - Value that already exists
 * @returns {ErrorResponse}
 */
function createAlreadyExistsErrorResponse(resourceType, field, value) {
    return createErrorResponse(
        ERROR_CODES.RESOURCE_ALREADY_EXISTS,
        `Ya existe ${resourceType} con ${field}: ${value}`
    );
}

/**
 * Creates a database error response
 * @param {string} operation - Database operation that failed
 * @param {Error} [originalError] - Original database error
 * @returns {ErrorResponse}
 */
function createDatabaseErrorResponse(operation, originalError = null) {
    return createErrorResponse(
        ERROR_CODES.DATABASE_ERROR,
        `Error en la base de datos durante: ${operation}`,
        originalError?.message
    );
}

module.exports = {
    ERROR_CODES,
    HTTP_STATUS,
    createSuccessResponse,
    createErrorResponse,
    createValidationErrorResponse,
    createNotFoundErrorResponse,
    createAlreadyExistsErrorResponse,
    createDatabaseErrorResponse
};