#!/usr/bin/env node

/**
 * Integration Test Script for Reward-Punishment System
 * Tests the complete frontend-backend integration
 */

// Using built-in fetch (Node.js 18+)

const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
    health: '/health',
    persons: '/api/persons',
    rewards: '/api/rewards',
    punishments: '/api/punishments',
    assignments: '/api/assignments',
    scoresTotal: '/api/scores/total',
    scoresWeekly: '/api/scores/weekly'
};

class IntegrationTester {
    constructor() {
        this.testResults = [];
        this.createdIds = {
            persons: [],
            rewards: [],
            punishments: [],
            assignments: []
        };
    }

    async log(message, isError = false) {
        const timestamp = new Date().toISOString();
        const prefix = isError ? '❌ ERROR' : '✅ INFO';
        console.log(`[${timestamp}] ${prefix}: ${message}`);
    }

    async test(name, testFn) {
        try {
            await this.log(`Starting test: ${name}`);
            await testFn();
            this.testResults.push({ name, status: 'PASSED' });
            await this.log(`Test passed: ${name}`);
        } catch (error) {
            this.testResults.push({ name, status: 'FAILED', error: error.message });
            await this.log(`Test failed: ${name} - ${error.message}`, true);
        }
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.message || 'Request failed'}`);
        }

        return data;
    }

    async runAllTests() {
        await this.log('Starting Integration Tests for Reward-Punishment System');

        // Test 1: Health Check
        await this.test('Server Health Check', async () => {
            const result = await this.makeRequest(API_ENDPOINTS.health);
            if (result.status !== 'OK') {
                throw new Error('Server health check failed');
            }
        });

        // Test 2: Create Person
        await this.test('Create Person', async () => {
            const personData = { name: 'Test Person 1' };
            const result = await this.makeRequest(API_ENDPOINTS.persons, {
                method: 'POST',
                body: JSON.stringify(personData)
            });
            this.createdIds.persons.push(result.id);
        });

        // Test 3: Create Reward
        await this.test('Create Reward', async () => {
            const rewardData = { name: 'Test Reward', value: 10 };
            const result = await this.makeRequest(API_ENDPOINTS.rewards, {
                method: 'POST',
                body: JSON.stringify(rewardData)
            });
            this.createdIds.rewards.push(result.id);
        });

        // Test 4: Create Punishment
        await this.test('Create Punishment', async () => {
            const punishmentData = { name: 'Test Punishment', value: -5 };
            const result = await this.makeRequest(API_ENDPOINTS.punishments, {
                method: 'POST',
                body: JSON.stringify(punishmentData)
            });
            this.createdIds.punishments.push(result.id);
        });

        // Test 5: Create Assignment
        await this.test('Create Assignment', async () => {
            if (this.createdIds.persons.length === 0 || this.createdIds.rewards.length === 0) {
                throw new Error('Prerequisites not met for assignment test');
            }

            const assignmentData = {
                personIds: [this.createdIds.persons[0]],
                itemType: 'reward',
                itemId: this.createdIds.rewards[0]
            };
            const result = await this.makeRequest(API_ENDPOINTS.assignments, {
                method: 'POST',
                body: JSON.stringify(assignmentData)
            });
            this.createdIds.assignments.push(result.id);
        });

        // Test 6: Get Total Scores
        await this.test('Get Total Scores', async () => {
            const result = await this.makeRequest(API_ENDPOINTS.scoresTotal);
            if (!Array.isArray(result)) {
                throw new Error('Total scores should return an array');
            }
        });

        // Test 7: Get Weekly Scores
        await this.test('Get Weekly Scores', async () => {
            const result = await this.makeRequest(API_ENDPOINTS.scoresWeekly);
            if (!Array.isArray(result)) {
                throw new Error('Weekly scores should return an array');
            }
        });

        await this.cleanup();
        await this.printResults();
    }

    async cleanup() {
        await this.log('Cleaning up test data...');

        // Clean up assignments
        for (const id of this.createdIds.assignments) {
            try {
                await this.makeRequest(`${API_ENDPOINTS.assignments}/${id}`, { method: 'DELETE' });
            } catch (error) {
                await this.log(`Failed to delete assignment ${id}: ${error.message}`, true);
            }
        }

        // Clean up persons, rewards, punishments
        const cleanupTasks = [
            { ids: this.createdIds.persons, endpoint: API_ENDPOINTS.persons },
            { ids: this.createdIds.rewards, endpoint: API_ENDPOINTS.rewards },
            { ids: this.createdIds.punishments, endpoint: API_ENDPOINTS.punishments }
        ];

        for (const task of cleanupTasks) {
            for (const id of task.ids) {
                try {
                    await this.makeRequest(`${task.endpoint}/${id}`, { method: 'DELETE' });
                } catch (error) {
                    await this.log(`Failed to delete ${task.endpoint}/${id}: ${error.message}`, true);
                }
            }
        }
    }

    async printResults() {
        await this.log('Integration Test Results:');
        console.log('\n=== TEST SUMMARY ===');

        let passed = 0;
        let failed = 0;

        for (const result of this.testResults) {
            const status = result.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
            console.log(`${status}: ${result.name}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }

            if (result.status === 'PASSED') passed++;
            else failed++;
        }

        console.log(`\nTotal: ${this.testResults.length} tests`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

        if (failed === 0) {
            console.log('\n🎉 All integration tests passed! Frontend-Backend integration is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the backend server and database connection.');
            process.exit(1);
        }
    }
}

// Run the tests
if (require.main === module) {
    const tester = new IntegrationTester();
    tester.runAllTests().catch(error => {
        console.error('Integration test runner failed:', error);
        process.exit(1);
    });
}

module.exports = IntegrationTester;