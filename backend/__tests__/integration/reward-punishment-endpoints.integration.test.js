const request = require('supertest');
const app = require('../../src/index');

describe('Reward and Punishment Endpoints Integration Tests', () => {
    let server;
    let testRewardIds = [];
    let testPunishmentIds = [];

    beforeAll(async () => {
        server = app.listen(0);
    });

    afterAll(async () => {
        // Clean up test data
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

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    describe('Reward Endpoints', () => {
        describe('Reward CRUD Operations', () => {
            test('should create reward with valid positive value', async () => {
                const rewardData = {
                    name: 'Good Behavior Reward',
                    value: 10
                };

                const response = await request(app)
                    .post('/api/rewards')
                    .send(rewardData)
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject(rewardData);
                expect(response.body.data.id).toBeDefined();
                expect(response.body.data.created_at).toBeDefined();

                testRewardIds.push(response.body.data.id);
            });

            test('should reject reward with negative value', async () => {
                const invalidData = {
                    name: 'Invalid Reward',
                    value: -5
                };

                const response = await request(app)
                    .post('/api/rewards')
                    .send(invalidData)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error).toBeDefined();
            });

            test('should reject reward with zero value', async () => {
                const invalidData = {
                    name: 'Zero Reward',
                    value: 0
                };

                const response = await request(app)
                    .post('/api/rewards')
                    .send(invalidData)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            test('should get all rewards', async () => {
                const response = await request(app)
                    .get('/api/rewards')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThan(0);
            });

            test('should get reward by ID', async () => {
                const rewardId = testRewardIds[0];

                const response = await request(app)
                    .get(`/api/rewards/${rewardId}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBe(rewardId);
                expect(response.body.data.name).toBe('Good Behavior Reward');
                expect(response.body.data.value).toBe(10);
            });

            test('should update reward', async () => {
                const rewardId = testRewardIds[0];
                const updateData = {
                    name: 'Updated Good Behavior Reward',
                    value: 15
                };

                const response = await request(app)
                    .put(`/api/rewards/${rewardId}`)
                    .send(updateData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject(updateData);
            });

            test('should delete reward', async () => {
                // Create a reward specifically for deletion
                const createResponse = await request(app)
                    .post('/api/rewards')
                    .send({ name: 'Reward To Delete', value: 5 });

                const rewardId = createResponse.body.data.id;

                const deleteResponse = await request(app)
                    .delete(`/api/rewards/${rewardId}`)
                    .expect(200);

                expect(deleteResponse.body.success).toBe(true);
                expect(deleteResponse.body.message).toContain('deleted');

                // Verify reward is deleted
                await request(app)
                    .get(`/api/rewards/${rewardId}`)
                    .expect(404);
            });
        });

        describe('Reward Statistics and Search', () => {
            beforeAll(async () => {
                // Create additional test rewards
                const rewards = [
                    { name: 'Excellent Work', value: 20 },
                    { name: 'Helping Others', value: 15 },
                    { name: 'Perfect Attendance', value: 25 }
                ];

                for (const reward of rewards) {
                    const response = await request(app)
                        .post('/api/rewards')
                        .send(reward);
                    testRewardIds.push(response.body.data.id);
                }
            });

            test('should get reward statistics', async () => {
                const response = await request(app)
                    .get('/api/rewards/statistics')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject({
                    totalRewards: expect.any(Number),
                    averageValue: expect.any(Number),
                    maxValue: expect.any(Number),
                    minValue: expect.any(Number)
                });
            });

            test('should search rewards by name', async () => {
                const response = await request(app)
                    .get('/api/rewards/search?name=Excellent')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].name).toContain('Excellent');
            });

            test('should get rewards by value range', async () => {
                const response = await request(app)
                    .get('/api/rewards/by-value-range?minValue=15&maxValue=25')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);

                // All returned rewards should be within the range
                response.body.data.forEach(reward => {
                    expect(reward.value).toBeGreaterThanOrEqual(15);
                    expect(reward.value).toBeLessThanOrEqual(25);
                });
            });

            test('should get recommended value', async () => {
                const response = await request(app)
                    .get('/api/rewards/recommended-value')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.recommendedValue).toBeGreaterThan(0);
            });
        });
    });

    describe('Punishment Endpoints', () => {
        describe('Punishment CRUD Operations', () => {
            test('should create punishment with valid negative value', async () => {
                const punishmentData = {
                    name: 'Late Arrival',
                    value: -5
                };

                const response = await request(app)
                    .post('/api/punishments')
                    .send(punishmentData)
                    .expect(201);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject(punishmentData);
                expect(response.body.data.id).toBeDefined();
                expect(response.body.data.created_at).toBeDefined();

                testPunishmentIds.push(response.body.data.id);
            });

            test('should reject punishment with positive value', async () => {
                const invalidData = {
                    name: 'Invalid Punishment',
                    value: 5
                };

                const response = await request(app)
                    .post('/api/punishments')
                    .send(invalidData)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error).toBeDefined();
            });

            test('should reject punishment with zero value', async () => {
                const invalidData = {
                    name: 'Zero Punishment',
                    value: 0
                };

                const response = await request(app)
                    .post('/api/punishments')
                    .send(invalidData)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            test('should get all punishments', async () => {
                const response = await request(app)
                    .get('/api/punishments')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThan(0);
            });

            test('should get punishment by ID', async () => {
                const punishmentId = testPunishmentIds[0];

                const response = await request(app)
                    .get(`/api/punishments/${punishmentId}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBe(punishmentId);
                expect(response.body.data.name).toBe('Late Arrival');
                expect(response.body.data.value).toBe(-5);
            });

            test('should update punishment', async () => {
                const punishmentId = testPunishmentIds[0];
                const updateData = {
                    name: 'Updated Late Arrival',
                    value: -10
                };

                const response = await request(app)
                    .put(`/api/punishments/${punishmentId}`)
                    .send(updateData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject(updateData);
            });

            test('should delete punishment', async () => {
                // Create a punishment specifically for deletion
                const createResponse = await request(app)
                    .post('/api/punishments')
                    .send({ name: 'Punishment To Delete', value: -3 });

                const punishmentId = createResponse.body.data.id;

                const deleteResponse = await request(app)
                    .delete(`/api/punishments/${punishmentId}`)
                    .expect(200);

                expect(deleteResponse.body.success).toBe(true);
                expect(deleteResponse.body.message).toContain('deleted');

                // Verify punishment is deleted
                await request(app)
                    .get(`/api/punishments/${punishmentId}`)
                    .expect(404);
            });
        });

        describe('Punishment Statistics and Search', () => {
            beforeAll(async () => {
                // Create additional test punishments
                const punishments = [
                    { name: 'Disruptive Behavior', value: -15 },
                    { name: 'Missing Assignment', value: -10 },
                    { name: 'Inappropriate Language', value: -20 }
                ];

                for (const punishment of punishments) {
                    const response = await request(app)
                        .post('/api/punishments')
                        .send(punishment);
                    testPunishmentIds.push(response.body.data.id);
                }
            });

            test('should get punishment statistics', async () => {
                const response = await request(app)
                    .get('/api/punishments/statistics')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toMatchObject({
                    totalPunishments: expect.any(Number),
                    averageValue: expect.any(Number),
                    maxValue: expect.any(Number),
                    minValue: expect.any(Number)
                });
            });

            test('should search punishments by name', async () => {
                const response = await request(app)
                    .get('/api/punishments/search?name=Disruptive')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThan(0);
                expect(response.body.data[0].name).toContain('Disruptive');
            });

            test('should get punishments by value range', async () => {
                const response = await request(app)
                    .get('/api/punishments/by-value-range?minValue=-20&maxValue=-10')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);

                // All returned punishments should be within the range
                response.body.data.forEach(punishment => {
                    expect(punishment.value).toBeGreaterThanOrEqual(-20);
                    expect(punishment.value).toBeLessThanOrEqual(-10);
                });
            });

            test('should get punishments by severity', async () => {
                const response = await request(app)
                    .get('/api/punishments/by-severity')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);

                // Should be ordered by severity (most negative first)
                for (let i = 1; i < response.body.data.length; i++) {
                    expect(response.body.data[i].value).toBeGreaterThanOrEqual(response.body.data[i - 1].value);
                }
            });

            test('should get punishment severity level', async () => {
                const punishmentId = testPunishmentIds.find(id => id); // Get first available ID

                const response = await request(app)
                    .get(`/api/punishments/${punishmentId}/severity`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.severity).toMatch(/^(low|medium|high)$/);
            });

            test('should get recommended value', async () => {
                const response = await request(app)
                    .get('/api/punishments/recommended-value')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.recommendedValue).toBeLessThan(0);
            });
        });
    });

    describe('Validation Tests', () => {
        test('should reject reward with missing name', async () => {
            const response = await request(app)
                .post('/api/rewards')
                .send({ value: 10 })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject punishment with missing name', async () => {
            const response = await request(app)
                .post('/api/punishments')
                .send({ value: -10 })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject reward with non-numeric value', async () => {
            const response = await request(app)
                .post('/api/rewards')
                .send({ name: 'Test', value: 'invalid' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject punishment with non-numeric value', async () => {
            const response = await request(app)
                .post('/api/punishments')
                .send({ name: 'Test', value: 'invalid' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should handle non-existent reward ID gracefully', async () => {
            const response = await request(app)
                .get('/api/rewards/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('should handle non-existent punishment ID gracefully', async () => {
            const response = await request(app)
                .get('/api/punishments/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });
    });
});