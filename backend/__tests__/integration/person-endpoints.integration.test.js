const request = require('supertest');
const app = require('../../src/index');

describe('Person Endpoints Integration Tests', () => {
    let server;
    let testPersonIds = [];

    beforeAll(async () => {
        server = app.listen(0);
    });

    afterAll(async () => {
        // Clean up test data
        for (const personId of testPersonIds) {
            try {
                await request(app).delete(`/api/persons/${personId}`);
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    describe('Person CRUD Operations', () => {
        test('should create person with valid data', async () => {
            const personData = {
                name: 'Test Person 1'
            };

            const response = await request(app)
                .post('/api/persons')
                .send(personData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                name: personData.name,
                id: expect.any(Number)
            });
            expect(response.body.data.created_at).toBeDefined();
            expect(response.body.data.updated_at).toBeDefined();

            testPersonIds.push(response.body.data.id);
        });

        test('should reject person with empty name', async () => {
            const invalidData = { name: '' };

            const response = await request(app)
                .post('/api/persons')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });

        test('should reject person with whitespace-only name', async () => {
            const invalidData = { name: '   ' };

            const response = await request(app)
                .post('/api/persons')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject person with duplicate name', async () => {
            const duplicateData = { name: 'Test Person 1' };

            const response = await request(app)
                .post('/api/persons')
                .send(duplicateData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('already exists');
        });

        test('should update person with valid data', async () => {
            const personId = testPersonIds[0];
            const updateData = { name: 'Updated Test Person 1' };

            const response = await request(app)
                .put(`/api/persons/${personId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.id).toBe(personId);
        });

        test('should get person by ID', async () => {
            const personId = testPersonIds[0];

            const response = await request(app)
                .get(`/api/persons/${personId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(personId);
            expect(response.body.data.name).toBe('Updated Test Person 1');
        });

        test('should return 404 for non-existent person', async () => {
            const response = await request(app)
                .get('/api/persons/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });
    });

    describe('Person Search and Statistics', () => {
        beforeAll(async () => {
            // Create additional test persons
            const persons = [
                { name: 'Alice Johnson' },
                { name: 'Bob Smith' },
                { name: 'Charlie Brown' }
            ];

            for (const person of persons) {
                const response = await request(app)
                    .post('/api/persons')
                    .send(person);
                testPersonIds.push(response.body.data.id);
            }
        });

        test('should get all persons', async () => {
            const response = await request(app)
                .get('/api/persons')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(4);
        });

        test('should search persons by name', async () => {
            const response = await request(app)
                .get('/api/persons/search?name=Alice')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].name).toContain('Alice');
        });

        test('should return empty array for non-matching search', async () => {
            const response = await request(app)
                .get('/api/persons/search?name=NonExistentName')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        test('should check name availability', async () => {
            const response = await request(app)
                .get('/api/persons/check-name?name=NewUniqueName')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.available).toBe(true);
        });

        test('should check name unavailability', async () => {
            const response = await request(app)
                .get('/api/persons/check-name?name=Alice Johnson')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.available).toBe(false);
        });

        test('should get person statistics', async () => {
            const response = await request(app)
                .get('/api/persons/statistics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                totalPersons: expect.any(Number),
                averageScore: expect.any(Number)
            });
            expect(response.body.data.totalPersons).toBeGreaterThanOrEqual(4);
        });
    });

    describe('Person Validation', () => {
        test('should reject person with missing name field', async () => {
            const response = await request(app)
                .post('/api/persons')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject person with null name', async () => {
            const response = await request(app)
                .post('/api/persons')
                .send({ name: null })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject person with non-string name', async () => {
            const response = await request(app)
                .post('/api/persons')
                .send({ name: 123 })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject person with excessively long name', async () => {
            const longName = 'a'.repeat(101); // Assuming 100 char limit

            const response = await request(app)
                .post('/api/persons')
                .send({ name: longName })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject update with invalid ID', async () => {
            const response = await request(app)
                .put('/api/persons/invalid-id')
                .send({ name: 'Valid Name' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should reject update for non-existent person', async () => {
            const response = await request(app)
                .put('/api/persons/999999')
                .send({ name: 'Valid Name' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Person Deletion', () => {
        test('should delete existing person', async () => {
            // Create a person specifically for deletion
            const createResponse = await request(app)
                .post('/api/persons')
                .send({ name: 'Person To Delete' });

            const personId = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/api/persons/${personId}`)
                .expect(200);

            expect(deleteResponse.body.success).toBe(true);
            expect(deleteResponse.body.message).toContain('deleted');

            // Verify person is deleted
            await request(app)
                .get(`/api/persons/${personId}`)
                .expect(404);
        });

        test('should return 404 when deleting non-existent person', async () => {
            const response = await request(app)
                .delete('/api/persons/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('not found');
        });

        test('should reject deletion with invalid ID', async () => {
            const response = await request(app)
                .delete('/api/persons/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});