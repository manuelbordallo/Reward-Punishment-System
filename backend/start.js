#!/usr/bin/env node

/**
 * Production startup script that ensures database is properly initialized
 */

const { spawn } = require('child_process');
const path = require('path');

async function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(' ')}`);

        const child = spawn(command, args, {
            stdio: 'inherit',
            cwd: options.cwd || process.cwd(),
            ...options
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing database...');

        // Run database migration
        await runCommand('node', ['scripts/migrate.js'], {
            cwd: __dirname
        });

        console.log('✅ Database initialized successfully');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);

        // Try to reset and migrate
        console.log('🔄 Attempting database reset...');
        try {
            await runCommand('node', ['scripts/migrate.js', 'reset'], {
                cwd: __dirname
            });
            console.log('✅ Database reset and initialized successfully');
        } catch (resetError) {
            console.error('❌ Database reset failed:', resetError.message);
            throw resetError;
        }
    }
}

async function startServer() {
    try {
        console.log('🚀 Starting server...');

        // Start the main application
        await runCommand('node', ['src/index.js'], {
            cwd: __dirname
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
}

async function main() {
    try {
        console.log('🏆 Reward-Punishment System - Production Startup');
        console.log('================================================');

        // Initialize database first
        await initializeDatabase();

        // Start the server
        await startServer();

    } catch (error) {
        console.error('💥 Startup failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the application
main();