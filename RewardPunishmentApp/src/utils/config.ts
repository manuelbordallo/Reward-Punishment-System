// Configuration for the app
export const config = {
    API_BASE_URL: __DEV__
        ? 'http://localhost:3000/api'
        : 'https://your-production-api.com/api',

    // Network configuration
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,

    // Development settings
    ENABLE_LOGGING: __DEV__,

    // Connection test endpoint
    HEALTH_CHECK_ENDPOINT: '/health',
};