const request = require('supertest');
const express = require('express');

// Import routes and middleware directly instead of the main app
const apiRoutes = require('../../routes');
const { 
  createCorsMiddleware, 
  globalErrorHandler, 
  notFoundHandler,
  timeoutHandler
} = require('../../middleware');
const { logger, requestLogger } = require('../../utils/logger');

// Create test app without starting a server
function createTestApp() {
  const app = express();

  // Request timeout middleware (30 seconds)
  app.use(timeoutHandler(30000));

  // Request logging middleware
  app.use(requestLogger);

  // CORS middleware with mobile client support
  app.use(createCorsMiddleware());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    logger.info('Health check requested');
    res.json({ 
      status: 'OK', 
      message: 'Reward-Punishment API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test'
    });
  });

  // API routes
  app.use('/api', apiRoutes);

  // 404 hand
dler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

describe('API Integration Tes
  let app;
  let testPersonId;
  let testRewardId;
  let testPd;
  let ttId;

  beforeAll(async () => {
    // Create test app instance
    app = createTestApp();
  });signmenestAsunishmentI {, () =>ts'tFoundHan, nouse('*'p.ap  routesned efir for undle

    describe('Health Check', () => {
        test('GET /health should return server status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'OK',
                message: 'Reward-Punishment API is running'
            });
            expect(response.body.timestamp).toBeDefined();
        });
    });

    describe('API Root', () => {
        test('GET /api should return API information', async () => {
            const response = await request(app)
                .get('/api')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Reward-Punishment System API',
                version: '1.0.0',
                endpoints: {
                    persons: '/api/persons',
                    rewards: '/api/rewards',
                    punishments: '/api/punishments',
                    assignments: '/api/assignments',
                    scores: '/api/scores'
                }
            });
        });
    });

    describe('Person Endpoints', () => {
        test('POST /api/persons should create a new person', async () => {
            const personData = {
                name: 'Integration Test Person'
            };

            const response = await request(app)
                .post('/api/persons')
                .send(personData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                name: personData.name
            });
            expect(response.body.data.id).toBeDefined();

            testPersonId = response.body.data.id;
        });

        test('GET /api/persons should return all persons', async () => {
            const response = await request(app)
                .get('/api/persons')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        test('GET /api/persons/:id should return specific person', async () => {
            const response = await request(app)
                .get(`/api/persons/${testPersonId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: testPersonId,
                name: 'Integration Test Person'
            });
        });

        test('PUT /api/persons/:id should update person', async () => {
            const updateData = {
                name: 'Updated Integration Test Person'
            };

            const response = await request(app)
                .put(`/api/persons/${testPersonId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
        });

        test('GET /api/persons/statistics should return person statistics', async () => {
            const response = await request(app)
                .get('/api/persons/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalPersons: expect.any(Number),
                averageScore: expect.any(Number)
            });
        });

        test('POST /api/persons should reject duplicate name', async () => {
            const duplicateData = {
                name: 'Updated Integration Test Person'
            };

            const response = await request(app)
                .post('/api/persons')
                .send(duplicateData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('already exists');
        });

        test('POST /api/persons should reject empty name', async () => {
            const invalidData = {
                name: ''
            };

            const response = await request(app)
                .post('/api/persons')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Reward Endpoints', () => {
        test('POST /api/rewards should create a new reward', async () => {
            const rewardData = {
                name: 'Integration Test Reward',
                value: 15
            };

            const response = await request(app)
                .post('/api/rewards')
                .send(rewardData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject(rewardData);
            expect(response.body.data.id).toBeDefined();

            testRewardId = response.body.data.id;
        });

        test('GET /api/rewards should return all rewards', async () => {
            const response = await request(app)
                .get('/api/rewards')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        test('GET /api/rewards/:id should return specific reward', async () => {
            const response = await request(app)
                .get(`/api/rewards/${testRewardId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: testRewardId,
                name: 'Integration Test Reward',
                value: 15
            });
        });

        test('PUT /api/rewards/:id should update reward', async () => {
            const updateData = {
                name: 'Updated Integration Test Reward',
                value: 20
            };

            const response = await request(app)
                .put(`/api/rewards/${testRewardId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject(updateData);
        });

        test('GET /api/rewards/statistics should return reward statistics', async () => {
            const response = await request(app)
                .get('/api/rewards/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalRewards: expect.any(Number),
                averageValue: expect.any(Number)
            });
        });

        test('POST /api/rewards should reject negative value', async () => {
            const invalidData = {
                name: 'Invalid Reward',
                value: -5
            };

            const response = await request(app)
                .post('/api/rewards')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('POST /api/rewards should reject zero value', async () => {
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
    });

    describe('Punishment Endpoints', () => {
        test('POST /api/punishments should create a new punishment', async () => {
            const punishmentData = {
                name: 'Integration Test Punishment',
                value: -10
            };

            const response = await request(app)
                .post('/api/punishments')
                .send(punishmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject(punishmentData);
            expect(response.body.data.id).toBeDefined();

            testPunishmentId = response.body.data.id;
        });

        test('GET /api/punishments should return all punishments', async () => {
            const response = await request(app)
                .get('/api/punishments')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        test('GET /api/punishments/:id should return specific punishment', async () => {
            const response = await request(app)
                .get(`/api/punishments/${testPunishmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: testPunishmentId,
                name: 'Integration Test Punishment',
                value: -10
            });
        });

        test('PUT /api/punishments/:id should update punishment', async () => {
            const updateData = {
                name: 'Updated Integration Test Punishment',
                value: -15
            };

            const response = await request(app)
                .put(`/api/punishments/${testPunishmentId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject(updateData);
        });

        test('GET /api/punishments/statistics should return punishment statistics', async () => {
            const response = await request(app)
                .get('/api/punishments/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalPunishments: expect.any(Number),
                averageValue: expect.any(Number)
            });
        });

        test('POST /api/punishments should reject positive value', async () => {
            const invalidData = {
                name: 'Invalid Punishment',
                value: 5
            };

            const response = await request(app)
                .post('/api/punishments')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('POST /api/punishments should reject zero value', async () => {
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
    });

    describe('Assignment Endpoints', () => {
        test('POST /api/assignments should create new assignments', async () => {
            const assignmentData = {
                itemType: 'reward',
                itemId: testRewardId,
                personIds: [testPersonId]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0]).toMatchObject({
                person_id: testPersonId,
                item_type: 'reward',
                item_id: testRewardId
            });

            testAssignmentId = response.body.data[0].id;
        });

        test('GET /api/assignments should return all assignments', async () => {
            const response = await request(app)
                .get('/api/assignments')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        test('GET /api/assignments/:id should return specific assignment', async () => {
            const response = await request(app)
                .get(`/api/assignments/${testAssignmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: testAssignmentId,
                person_id: testPersonId,
                item_type: 'reward',
                item_id: testRewardId
            });
        });

        test('GET /api/assignments/person/:personId should return assignments for person', async () => {
            const response = await request(app)
                .get(`/api/assignments/person/${testPersonId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].person_id).toBe(testPersonId);
        });

        test('GET /api/assignments/statistics should return assignment statistics', async () => {
            const response = await request(app)
                .get('/api/assignments/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalAssignments: expect.any(Number),
                rewardAssignments: expect.any(Number),
                punishmentAssignments: expect.any(Number)
            });
        });

        test('POST /api/assignments should create multiple assignments', async () => {
            // Create another person for multiple assignment test
            const person2Response = await request(app)
                .post('/api/persons')
                .send({ name: 'Second Test Person' });

            const person2Id = person2Response.body.data.id;

            const assignmentData = {
                itemType: 'punishment',
                itemId: testPunishmentId,
                personIds: [testPersonId, person2Id]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(assignmentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(2);

            // Clean up second person
            await request(app).delete(`/api/persons/${person2Id}`);
        });

        test('POST /api/assignments should reject invalid item type', async () => {
            const invalidData = {
                itemType: 'invalid',
                itemId: testRewardId,
                personIds: [testPersonId]
            };

            const response = await request(app)
                .post('/api/assignments')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Score Endpoints', () => {
        test('GET /api/scores/total should return total scores', async () => {
            const response = await request(app)
                .get('/api/scores/total')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);

            // Find our test person in the results
            const testPersonScore = response.body.data.find(score => score.person_id === testPersonId);
            expect(testPersonScore).toBeDefined();
            expect(testPersonScore.total_score).toBeDefined();
        });

        test('GET /api/scores/weekly should return weekly scores', async () => {
            const response = await request(app)
                .get('/api/scores/weekly')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);

            // Find our test person in the results
            const testPersonScore = response.body.data.find(score => score.person_id === testPersonId);
            expect(testPersonScore).toBeDefined();
            expect(testPersonScore.weekly_score).toBeDefined();
        });

        test('GET /api/scores/person/:personId should return person score', async () => {
            const response = await request(app)
                .get(`/api/scores/person/${testPersonId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                person_id: testPersonId,
                total_score: expect.any(Number),
                weekly_score: expect.any(Number)
            });
        });

        test('GET /api/scores/person/:personId/weekly should return person weekly score', async () => {
            const response = await request(app)
                .get(`/api/scores/person/${testPersonId}/weekly`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                person_id: testPersonId,
                weekly_score: expect.any(Number)
            });
        });

        test('GET /api/scores/statistics should return score statistics', async () => {
            const response = await request(app)
                .get('/api/scores/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalPersons: expect.any(Number),
                averageTotalScore: expect.any(Number),
                averageWeeklyScore: expect.any(Number)
            });
        });

        test('GET /api/scores/current-week should return current week info', async () => {
            const response = await request(app)
                .get('/api/scores/current-week')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                weekStart: expect.any(String),
                weekEnd: expect.any(String)
            });
        });
    });

    describe('Error Handling', () => {
        test('GET /api/persons/999999 should return 404 for non-existent person', async () => {
            const response = await request(app)
                .get('/api/persons/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('GET /api/rewards/999999 should return 404 for non-existent reward', async () => {
            const response = await request(app)
                .get('/api/rewards/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('GET /api/punishments/999999 should return 404 for non-existent punishment', async () => {
            const response = await request(app)
                .get('/api/punishments/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('GET /api/assignments/999999 should return 404 for non-existent assignment', async () => {
            const response = await request(app)
                .get('/api/assignments/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('GET /api/scores/person/999999 should return 404 for non-existent person', async () => {
            const response = await request(app)
                .get('/api/scores/person/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('POST /api/persons with invalid data should return 400', async () => {
            const response = await request(app)
                .post('/api/persons')
                .send({ invalidField: 'test' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('GET /api/nonexistent should return 404', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Cleanup', () => {
        test('DELETE /api/assignments/:id should delete assignment', async () => {
            const response = await request(app)
                .delete(`/api/assignments/${testAssignmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
        });

        test('DELETE /api/rewards/:id should delete reward', async () => {
            const response = await request(app)
                .delete(`/api/rewards/${testRewardId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
        });

        test('DELETE /api/punishments/:id should delete punishment', async () => {
            const response = await request(app)
                .delete(`/api/punishments/${testPunishmentId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
        });

        test('DELETE /api/persons/:id should delete person', async () => {
            const response = await request(app)
                .delete(`/api/persons/${testPersonId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
        });
    });
});