/**
 * Structured logging utility for the application
 * Provides consistent logging format and different log levels
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

/**
 * Colors for console output
 */
const COLORS = {
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    info: '\x1b[36m',    // Cyan
    debug: '\x1b[37m',   // White
    reset: '\x1b[0m'     // Reset
};

/**
 * Get current timestamp in ISO format
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format log message for console output
 */
function formatConsoleMessage(level, message, meta = {}) {
    const timestamp = getTimestamp();
    const color = COLORS[level] || COLORS.reset;
    const levelUpper = level.toUpperCase().padEnd(5);

    let logMessage = `${color}[${timestamp}] ${levelUpper} ${message}${COLORS.reset}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
        logMessage += `\n${color}Meta: ${JSON.stringify(meta, null, 2)}${COLORS.reset}`;
    }

    return logMessage;
}

/**
 * Format log message for JSON output (production)
 */
function formatJsonMessage(level, message, meta = {}) {
    return JSON.stringify({
        timestamp: getTimestamp(),
        level: level.toUpperCase(),
        message,
        ...meta
    });
}

/**
 * Determine if log level should be output
 */
function shouldLog(level) {
    const currentLevel = process.env.LOG_LEVEL || 'info';
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(currentLevel);
    const messageIndex = levels.indexOf(level);

    return messageIndex <= currentIndex;
}

/**
 * Core logging function
 */
function log(level, message, meta = {}) {
    if (!shouldLog(level)) {
        return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const formattedMessage = isProduction
        ? formatJsonMessage(level, message, meta)
        : formatConsoleMessage(level, message, meta);

    // Output to appropriate stream
    if (level === LOG_LEVELS.ERROR) {
        console.error(formattedMessage);
    } else {
        console.log(formattedMessage);
    }
}

/**
 * Logger object with different log levels
 */
const logger = {
    /**
     * Log error messages
     */
    error(message, meta = {}) {
        log(LOG_LEVELS.ERROR, message, meta);
    },

    /**
     * Log warning messages
     */
    warn(message, meta = {}) {
        log(LOG_LEVELS.WARN, message, meta);
    },

    /**
     * Log info messages
     */
    info(message, meta = {}) {
        log(LOG_LEVELS.INFO, message, meta);
    },

    /**
     * Log debug messages
     */
    debug(message, meta = {}) {
        log(LOG_LEVELS.DEBUG, message, meta);
    },

    /**
     * Log HTTP requests
     */
    request(req, res, responseTime) {
        const meta = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length') || 0
        };

        const level = res.statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
        const message = `${req.method} ${req.originalUrl} - ${res.statusCode}`;

        log(level, message, meta);
    },

    /**
     * Log database operations
     */
    database(operation, table, meta = {}) {
        this.debug(`Database ${operation} on ${table}`, meta);
    },

    /**
     * Log service operations
     */
    service(service, operation, meta = {}) {
        this.debug(`${service} - ${operation}`, meta);
    },

    /**
     * Log validation errors
     */
    validation(errors, meta = {}) {
        this.warn('Validation failed', { errors, ...meta });
    },

    /**
     * Log business rule violations
     */
    businessRule(rule, meta = {}) {
        this.warn(`Business rule violation: ${rule}`, meta);
    },

    /**
     * Log performance metrics
     */
    performance(operation, duration, meta = {}) {
        this.info(`Performance: ${operation} took ${duration}ms`, meta);
    }
};

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();

    // Log request start
    logger.debug('Request started', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;
        logger.request(req, res, responseTime);
        originalEnd.call(this, chunk, encoding);
    };

    next();
}

module.exports = {
    logger,
    requestLogger,
    LOG_LEVELS
};