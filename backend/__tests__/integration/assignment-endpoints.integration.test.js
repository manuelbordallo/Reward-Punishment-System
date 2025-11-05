const request = require('supertest');
const app = require('../../src/index');

describe('Assignment Endpoints Integration Tests', () => {
    let server;
    let testPersonIds = [];
    let testRewardIds = [];
    let testPunishmentIds = [];
    let testAssignmentIds = [];

    beforeAll(async () => {
        server = app.listen(0);

        // Create test data
        await setupTestData();
    });

    afterAll(async () => {
        // Clean up test data
        await cleanupTestData();

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    async function setupTestData() {
        // Create test persons
        const persons = [
            { name: 'Assignment Test Person 1' },
            { name: 'Assignment Test Person 2' },
            { name: 'Assignment Test Person 3' }
        ];

        for (const person of persons) {
            const response = await request(app)
                .post('/api/persons')
                .send(person);
            testPersonIds.push(response.body.data.id);
        }

        // Create test rewards
        const rewards = [
            { name: 'Assignment Test Reward 1', value: 10 },
            { name: 'Assignment Test Reward 2', value: 15 }
        ];

        for (const reward of rewards) {
            const response = await request(app)
                .post('/api/rewards')
                .send(reward);
            testRewardIds.push(response.body.data.id);
        }

        // Create test punishments
        const punishments = [
            { name: 'Assignment Test Punishment 1', value: -5 },
            { name: 'Assignment Test Punishment 2', value: -10 }
        ];

        for (const punishment of punishments) {
            const response = await request(app)
                .post('/api/punishments')
                .send(punishment);
            testPunishmentIds.push(response.body.data.id);
        }
    }

    async function cleanupTestData() {
        // Clean up assignments
        for (const assignmentId of testAssignmentIds) {
            try {
                await request(app).delete(`/api/assignments/${assignmentId}`);
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        // Clean up persons, rewards, punishments
        for (const personId of testPersonIds) {
            try {
                await request(app).delete(`/api/persons/${personId}`);
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        for (const rewardId of testRewardIds) {
            try {
                await request(app).delete(`/api/rewards/${rewardId}`);
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        for (const punishmentId of testPunishmentIds) {
            try {
                await request(app).delete(`/api/punishments/${punishmentId}`);
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    }

    describe('Assignment Creation', () => {
        test('should create single reward assignment', async () => {
            const assignmentData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: [testPersonIds[0]]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(1);

            const assignment = response.body.data[0];
            expect(assignment).toMatchObject({
                person_id: testPersonIds[0],
                item_type: 'reward',
                item_id: testRewardIds[0],
                item_value: 10
            });
            expect(assignment.id).toBeDefined();
            expect(assignment.assigned_at).toBeDefined();

            testAssignmentIds.push(assignment.id);
        });

        test('should create single punishment assignment', async () => {
            const assignmentData = {
                itemType: 'punishment',
                itemId: testPunishmentIds[0],
                personIds: [testPersonIds[1]]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(1);

            const assignment = response.body.data[0];
            expect(assignment).toMatchObject({
                person_id: testPersonIds[1],
                item_type: 'punishment',
                item_id: testPunishmentIds[0],
                item_value: -5
            });

            testAssignmentIds.push(assignment.id);
        });

        test('should create multiple assignments for multiple persons', async () => {
            const assignmentData = {
                itemType: 'reward',
                itemId: testRewardIds[1],
                personIds: [testPersonIds[0], testPersonIds[1], testPersonIds[2]]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(3);

            // All assignments should have the same reward but different persons
            response.body.data.forEach((assignment, index) => {
                expect(assignment).toMatchObject({
                    person_id: testPersonIds[index],
                    item_type: 'reward',
                    item_id: testRewardIds[1],
                    item_value: 15
                });
                testAssignmentIds.push(assignment.id);
            });
        });

        test('should reject assignment with invalid item type', async () => {
            const invalidData = {
                itemType: 'invalid',
                itemId: testRewardIds[0],
                personIds: [testPersonIds[0]]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });

        test('should reject assignment with non-existent reward', async () => {
            const invalidData = {
                itemType: 'reward',
                itemId: 999999,
                personIds: [testPersonIds[0]]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(invalidData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('should reject assignment with non-existent person', async () => {
            const invalidData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: [999999]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(invalidData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('should reject assignment with empty person IDs', async () => {
            const invalidData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: []
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Assignment Retrieval', () => {
        test('should get all assignments', async () => {
            const response = await request(app)
                .get('/api/assignments')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        test('should get assignment by ID', async () => {
            const assignmentId = testAssignmentIds[0];

            const response = await request(app)
                .get(`/api/assignments/${assignmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(assignmentId);
            expect(response.body.data.person_id).toBeDefined();
            expect(response.body.data.item_type).toBeDefined();
            expect(response.body.data.item_id).toBeDefined();
        });

        test('should get assignments by person ID', async () => {
            const personId = testPersonIds[0];

            const response = await request(app)
                .get(`/api/assignments/person/${personId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);

            // All assignments should belong to the specified person
            response.body.data.forEach(assignment => {
                expect(assignment.person_id).toBe(personId);
            });
        });

        test('should get recent assignments', async () => {
            const response = await request(app)
                .get('/api/assignments/recent?limit=5')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(5);

            // Should be ordered by most recent first
            for (let i = 1; i < response.body.data.length; i++) {
                const current = new Date(response.body.data[i].assigned_at);
                const previous = new Date(response.body.data[i - 1].assigned_at);
                expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
            }
        });

        test('should get assignments by date range', async () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const response = await request(app)
                .get(`/api/assignments/date-range?startDate=${yesterday.toISOString().split('T')[0]}&endDate=${tomorrow.toISOString().split('T')[0]}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);

            // All assignments should be within the date range
            response.body.data.forEach(assignment => {
                const assignedDate = new Date(assignment.assigned_at);
                expect(assignedDate.getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
                expect(assignedDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime());
            });
        });

        test('should return 404 for non-existent assignment', async () => {
            const response = await request(app)
                .get('/api/assignments/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });
    });

    describe('Assignment Statistics', () => {
        test('should get assignment statistics', async () => {
            const response = await request(app)
                .get('/api/assignments/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalAssignments: expect.any(Number),
                rewardAssignments: expect.any(Number),
                punishmentAssignments: expect.any(Number),
                averageValue: expect.any(Number)
            });
            expect(response.body.data.totalAssignments).toBeGreaterThan(0);
        });

        test('should get item assignment summary', async () => {
            const response = await request(app)
                .get(`/api/assignments/item-summary/reward/${testRewardIds[0]}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                itemType: 'reward',
                itemId: testRewardIds[0],
                totalAssignments: expect.any(Number),
                uniquePersons: expect.any(Number)
            });
        });
    });

    describe('Assignment Validation', () => {
        test('should validate assignment data', async () => {
            const validData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: [testPersonIds[0]]
            };

            const response = await request(app)
                .post('/api/assignments/validate')
                .send(validData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(true);
        });

        test('should reject invalid assignment data in validation', async () => {
            const invalidData = {
                itemType: 'invalid',
                itemId: testRewardIds[0],
                personIds: [testPersonIds[0]]
            };

            const response = await request(app)
                .post('/api/assignments/validate')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Assignment Deletion', () => {
        test('should delete assignment', async () => {
            // Create an assignment specifically for deletion
            const createResponse = await request(app)
                .post('/api/assignments')
                .send({
                    itemType: 'reward',
                    itemId: testRewardIds[0],
                    personIds: [testPersonIds[0]]
                });

            const assignmentId = createResponse.body.data[0].id;

            const deleteResponse = await request(app)
                .delete(`/api/assignments/${assignmentId}`)
                .expect(200);

            expect(deleteResponse.body.success).toBe(true);
            expect(deleteResponse.body.message).toContain('deleted');

            // Verify assignment is deleted
            await request(app)
                .get(`/api/assignments/${assignmentId}`)
                .expect(404);
        });

        test('should return 404 when deleting non-existent assignment', async () => {
            const response = await request(app)
                .delete('/api/assignments/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('should reject deletion with invalid ID', async () => {
            const response = await request(app)
                .delete('/api/assignments/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Assignment Edge Cases', () => {
        test('should handle assignment to same person multiple times', async () => {
            const assignmentData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: [testPersonIds[0]]
            };

            // Create first assignment
            const response1 = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            // Create second assignment to same person
            const response2 = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response1.body.success).toBe(true);
            expect(response2.body.success).toBe(true);

            // Both should be successful (no uniqueness constraint)
            testAssignmentIds.push(response1.body.data[0].id);
            testAssignmentIds.push(response2.body.data[0].id);
        });

        test('should handle mixed valid and invalid person IDs gracefully', async () => {
            const invalidData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: [testPersonIds[0], 999999] // One valid, one invalid
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(invalidData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('should handle large number of person IDs', async () => {
            const assignmentData = {
                itemType: 'reward',
                itemId: testRewardIds[0],
                personIds: testPersonIds // All test persons
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(testPersonIds.length);

            // Add to cleanup list
            response.body.data.forEach(assignment => {
                testAssignmentIds.push(assignment.id);
            });
        });
    });
});