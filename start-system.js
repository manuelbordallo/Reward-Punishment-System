#!/usr/bin/env node

/**
 * System Startup Script
 * Helps start both backend and frontend for development
 */

const { spawn } = require('child_process');
const path = require('path');

class SystemStarter {
    constructor() {
        this.processes = [];
    }

    log(message, source = 'SYSTEM') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${source}] ${message}`);
    }

    async startBackend() {
        return new Promise((resolve, reject) => {
            this.log('Starting backend server...', 'BACKEND');
            
            const backendProcess = spawn('npm', ['run', 'dev'], {
                cwd: path.join(__dirname, 'backend'),
                stdio: 'pipe'
            });

            backendProcess.stdout.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    this.log(message, 'BACKEND');
                    if (message.includes('Server running on port')) {
                        resolve(backendProcess);
                    }
                }
            });

            backendProcess.stderr.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    this.log(`ERROR: ${message}`, 'BACKEND');
                }
            });

            backendProcess.on('error', (error) => {
                this.log(`Failed to start backend: ${error.message}`, 'BACKEND');
                reject(error);
            });

            this.processes.push(backendProcess);
            
            // Timeout after 30 seconds
            setTimeout(() => {
                reject(new Error('Backend startup timeout'));
            }, 30000);
        });
    }

    async startFrontend() {
        return new Promise((resolve) => {
            this.log('Starting React Native Metro bundler...', 'FRONTEND');
            
            const frontendProcess = spawn('npm', ['start'], {
                cwd: path.join(__dirname, 'RewardPunishmentApp'),
                stdio: 'pipe'
            });

            frontendProcess.stdout.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    this.log(message, 'FRONTEND');
                }
            });

            frontendProcess.stderr.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    this.log(`ERROR: ${message}`, 'FRONTEND');
                }
            });

            frontendProcess.on('error', (error) => {
                this.log(`Frontend error: ${error.message}`, 'FRONTEND');
            });

            this.processes.push(frontendProcess);
            resolve(frontendProcess);
        });
    }

    async checkPrerequisites() {
        this.log('Checking prerequisites...');
        
        // Check if backend dependencies are installed
        const fs = require('fs');
        const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
        const frontendNodeModules = path.join(__dirname, 'RewardPunishmentApp', 'node_modules');
        
        if (!fs.existsSync(backendNodeModules)) {
            throw new Error('Backend dependencies not installed. Run "npm install" in the backend directory.');
        }
        
        if (!fs.existsSync(frontendNodeModules)) {
            throw new Error('Frontend dependencies not installed. Run "npm install" in the RewardPunishmentApp directory.');
        }
        
        this.log('Prerequisites check passed ✅');
    }

    async start() {
        try {
            await this.checkPrerequisites();
            
            this.log('🚀 Starting Reward-Punishment System...');
            
            // Start backend first
            await this.startBackend();
            this.log('Backend started successfully ✅', 'BACKEND');
            
            // Wait a moment for backend to fully initialize
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Start frontend
            await this.startFrontend();
            this.log('Frontend started successfully ✅', 'FRONTEND');
            
            this.log('🎉 System is running!');
            this.log('Backend API: http://localhost:3000');
            this.log('Frontend Metro: http://localhost:8081');
            this.log('Press Ctrl+C to stop all services');
            
        } catch (error) {
            this.log(`Failed to start system: ${error.message}`, 'ERROR');
            this.cleanup();
            process.exit(1);
        }
    }

    cleanup() {
        this.log('Shutting down services...');
        this.processes.forEach(process => {
            if (process && !process.killed) {
                process.kill('SIGTERM');
            }
        });
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the system
if (require.main === module) {
    const starter = new SystemStarter();
    
    process.on('exit', () => {
        starter.cleanup();
    });
    
    starter.start().catch(error => {
        console.error('System startup failed:', error);
        process.exit(1);
    });
}

module.exports = SystemStarter;