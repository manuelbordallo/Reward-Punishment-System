const {
    createErrorResponse,
    createDatabaseErrorResponse,
    ERROR_CODES,
    HTTP_STATUS
} = require('../models/ApiResponse');
const { logger } = require('../utils/logger');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
    }
}

/**
 * Custom error class for not found errors
 */
class NotFoundError extends AppError {
    constructor(resource, id) {
        super(
            `${resource} con ID ${id} no encontrado`,
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.RESOURCE_NOT_FOUND
        );
    }
}

/**
 * Custom error class for conflict errors (duplicate resources)
 */
class ConflictError extends AppError {
    constructor(message) {
        super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.RESOURCE_ALREADY_EXISTS);
    }
}

/**
 * Custom error class for business rule violations
 */
class BusinessRuleError extends AppError {
    constructor(message, details = null) {
        super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.BUSINESS_RULE_VIOLATION, details);
    }
}

/**
 * Maps database error codes to application errors
 * @param {Error} error - Database error
 * @returns {AppError} Mapped application error
 */
function mapDatabaseError(error) {
    // PostgreSQL error codes
    switch (error.code) {
        case '23505': // unique_violation
            return new ConflictError('Ya existe un registro con estos datos');

        case '23503': // foreign_key_violation
            return new AppError(
                'No se puede completar la operación debido a referencias existentes',
                HTTP_STATUS.CONFLICT,
                ERROR_CODES.CONSTRAINT_VIOLATION
            );

        case '23502': // not_null_violation
            return new ValidationError('Faltan campos requeridos');

        case '23514': // check_constraint_violation
            return new ValidationError('Los datos no cumplen con las reglas de validación');

        case '42P01': // undefined_table
        case '42703': // undefined_column
            return new AppError(
                'Error de configuración de base de datos',
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ERROR_CODES.DATABASE_ERROR
            );

        default:
            return new AppError(
                'Error en la base de datos',
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ERROR_CODES.DATABASE_ERROR,
                error.message
            );
    }
}

/**
 * Handles operational errors (known errors that we can recover from)
 * @param {AppError} error - Application error
 * @param {Object} res - Express response object
 */
function handleOperationalError(error, res) {
    logger.warn('Operational error occurred', {
        error: error.message,
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        details: error.details,
        stack: error.stack
    });

    res.status(error.statusCode).json(
        createErrorResponse(error.errorCode, error.message, error.details)
    );
}

/**
 * Handles programming errors (bugs that need to be fixed)
 * @param {Error} error - Programming error
 * @param {Object} res - Express response object
 */
function handleProgrammingError(error, res) {
    logger.error('Programming error occurred', {
        error: error.message,
        stack: error.stack,
        name: error.name
    });

    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : error.message;

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, message)
    );
}

/**
 * Global error handling middleware
 * This should be the last middleware in the application
 */
function globalErrorHandler(error, req, res, next) {
    // Log the request context
    logger.error('Error processing request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Handle database errors
    if (error.code && typeof error.code === 'string') {
        const mappedError = mapDatabaseError(error);
        return handleOperationalError(mappedError, res);
    }

    // Handle application errors
    if (error instanceof AppError && error.isOperational) {
        return handleOperationalError(error, res);
    }

    // Handle programming errors
    handleProgrammingError(error, res);
}

/**
 * Middleware to handle async route handlers
 * Catches async errors and passes them to the error handler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res, next) {
    const error = new AppError(
        `Ruta ${req.method} ${req.originalUrl} no encontrada`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESOURCE_NOT_FOUND
    );
    next(error);
}

/**
 * Request timeout middleware
 */
function timeoutHandler(timeout = 30000) {
    return (req, res, next) => {
        res.setTimeout(timeout, () => {
            const error = new AppError(
                'Tiempo de espera agotado',
                HTTP_STATUS.SERVICE_UNAVAILABLE,
                ERROR_CODES.SERVICE_UNAVAILABLE
            );
            next(error);
        });
        next();
    };
}

module.exports = {
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
};