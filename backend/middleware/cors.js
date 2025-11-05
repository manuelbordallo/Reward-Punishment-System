const cors = require('cors');

/**
 * CORS configuration for mobile client
 */
const corsOptions = {
    // Allow requests from mobile development environments
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',      // React development server
            'http://localhost:19006',     // Expo development server
            'http://localhost:8081',      // React Native Metro bundler
            'exp://localhost:19000',      // Expo client
            'exp://192.168.1.100:19000',  // Expo client on local network (example IP)
            // Add more origins as needed for different development environments
        ];

        // Allow any localhost origin for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        // Allow Expo development URLs
        if (origin.startsWith('exp://')) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // In development, allow all origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        }
    },

    // Allow credentials (cookies, authorization headers, etc.)
    credentials: true,

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

    // Allowed headers
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-Access-Token',
        'X-Key',
        'X-Client-Version'
    ],

    // Headers exposed to the client
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ],

    // Preflight cache duration (in seconds)
    maxAge: 86400, // 24 hours

    // Handle preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 200
};

/**
 * Development CORS configuration (more permissive)
 */
const devCorsOptions = {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*',
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ]
};

/**
 * Production CORS configuration (more restrictive)
 */
const prodCorsOptions = {
    origin: [
        // Add your production mobile app domains here
        // 'https://your-app.com',
        // 'https://api.your-app.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ],
    maxAge: 86400
};

/**
 * Get CORS configuration based on environment
 */
function getCorsOptions() {
    switch (process.env.NODE_ENV) {
        case 'production':
            return prodCorsOptions;
        case 'development':
            return devCorsOptions;
        default:
            return corsOptions;
    }
}

/**
 * Create CORS middleware
 */
function createCorsMiddleware() {
    const options = getCorsOptions();
    return cors(options);
}

module.exports = {
    corsOptions,
    devCorsOptions,
    prodCorsOptions,
    getCorsOptions,
    createCorsMiddleware
};