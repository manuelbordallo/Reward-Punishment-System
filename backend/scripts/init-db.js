const { testConnection } = require('../config/database');
const { runMigrations } = require('./migrate');

/**
 * Initialize database - test connection and run migrations
 */
async function initializeDatabase() {
    console.log('Initializing database...');

    try {
        // Test database connection
        console.log('Testing database connection...');
        const isConnected = await testConnection();

        if (!isConnected) {
            throw new Error('Could not connect to database. Please check your database configuration.');
        }

        // Run migrations
        console.log('Running database migrations...');
        await runMigrations();

        console.log('Database initialization completed successfully!');

    } catch (error) {
        console.error('Database initialization failed:', error.message);
        console.error('\nPlease ensure:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database exists or user has permission to create it');
        console.error('3. Database credentials in .env file are correct');
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database ready!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Initialization failed:', error);
            process.exit(1);
        });
}

module.exports = {
    initializeDatabase
};