const request = require('supertest');
const app = require('../../src/index');

describe('Score Endpoints Integration Tests', () => {
  let server;
  let testPersonIds = [];
  let testRewardIds = [];
  let testPunishmentIds = [];
  let testAssignmentIds = [];

  beforeAll(async () => {
    server = app.listen(0);
    
    // Create test data and assignments for score calculations
    await setupTestDataWithScores();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  async function setupTestDataWithScores() {
    // Create test persons
    const persons = [
      { name: 'Score Test Person 1' },
      { name: 'Score Test Person 2' },
      { name: 'Score Test Person 3' }
    ];

    for (const person of persons) {
      const response = await request(app)
        .post('/api/persons')
        .send(person);
      testPersonIds.push(response.body.data.id);
    }

    // Create test rewards
    const rewards = [
      { name: 'Score Test Reward 1', value: 10 },
      { name: 'Score Test Reward 2', value: 20 },
      { name: 'Score Test Reward 3', value: 15 }
    ];

    for (const reward of rewards) {
      const response = await request(app)
        .post('/api/rewards')
        .send(reward);
      testRewardIds.push(response.body.data.id);
    }

    // Create test punishments
    const punishments = [
      { name: 'Score Test Punishment 1', value: -5 },
      { name: 'Score Test Punishment 2', value: -10 },
      { name: 'Score Test Punishment 3', value: -15 }
    ];

    for (const punishment of punishments) {
      const response = await request(app)
        .post('/api/punishments')
        .send(punishment);
      testPunishmentIds.push(response.body.data.id);
    }

    // Create assignments to generate scores
    const assignments = [
      // Person 1: +10, +20, -5 = 25 total
      { itemType: 'reward', itemId: testRewardIds[0], personIds: [testPersonIds[0]] },
      { itemType: 'reward', itemId: testRewardIds[1], personIds: [testPersonIds[0]] },
      { itemType: 'punishment', itemId: testPunishmentIds[0], personIds: [testPersonIds[0]] },
      
      // Person 2: +15, -10 = 5 total
      { itemType: 'reward', itemId: testRewardIds[2], personIds: [testPersonIds[1]] },
      { itemType: 'punishment', itemId: testPunishmentIds[1], personIds: [testPersonIds[1]] },
      
      // Person 3: -15 = -15 total
      { itemType: 'punishment', itemId: testPunishmentIds[2], personIds: [testPersonIds[2]] }
    ];

    for (const assignment of assignments) {
      const response = await request(app)
        .post('/api/assignments')
        .send(assignment);
      testAssignmentIds.push(...response.body.data.map(a => a.id));
    }
  }

  async function cleanupTestData() {
    // Clean up assignments first
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

  describe('Total Score Endpoints', () => {
    test('should get total scores for all persons', async () => {
      const response = await request(app)
        .get('/api/scores/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);

      // Find our test persons in the results
      const person1Score = response.body.data.find(score => score.person_id === testPersonIds[0]);
      const person2Score = response.body.data.find(score => score.person_id === testPersonIds[1]);
      const person3Score = response.body.data.find(score => score.person_id === testPersonIds[2]);

      expect(person1Score).toBeDefined();
      expect(person2Score).toBeDefined();
      expect(person3Score).toBeDefined();

      // Verify calculated scores
      expect(person1Score.total_score).toBe(25); // 10 + 20 - 5
      expect(person2Score.total_score).toBe(5);  // 15 - 10
      expect(person3Score.total_score).toBe(-15); // -15

      // Verify scores are ordered (highest first)
      for (let i = 1; i < response.body.data.length; i++) {
        expect(response.body.data[i].total_score).toBeLessThanOrEqual(response.body.data[i-1].total_score);
      }
    });

    test('should get score for specific person', async () => {
      const personId = testPersonIds[0];

      const response = await request(app)
        .get(`/api/scores/person/${personId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        person_id: personId,
        person_name: 'Score Test Person 1',
        total_score: 25,
        assignment_count: 3
      });
    });

    test('should return 404 for non-existent person score', async () => {
      const response = await request(app)
        .get('/api/scores/person/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });
  });

  describe('Weekly Score Endpoints', () => {
    test('should get weekly scores for all persons', async () => {
      const response = await request(app)
        .get('/api/scores/weekly')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);

      // Find our test persons in the results
      const person1Score = response.body.data.find(score => score.person_id === testPersonIds[0]);
      const person2Score = response.body.data.find(score => score.person_id === testPersonIds[1]);
      const person3Score = response.body.data.find(score => score.person_id === testPersonIds[2]);

      expect(person1Score).toBeDefined();
      expect(person2Score).toBeDefined();
      expect(person3Score).toBeDefined();

      // Since assignments were created today, weekly scores should match total scores
      expect(person1Score.weekly_score).toBe(25);
      expect(person2Score.weekly_score).toBe(5);
      expect(person3Score.weekly_score).toBe(-15);
    });

    test('should get weekly score for specific person', async () => {
      const personId = testPersonIds[1];

      const response = await request(app)
        .get(`/api/scores/person/${personId}/weekly`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        person_id: personId,
        person_name: 'Score Test Person 2',
        weekly_score: 5
      });
    });

    test('should get weekly scores with custom week start', async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7); // Last week

      const response = await request(app)
        .get(`/api/scores/weekly?weekStart=${weekStart.toISOString().split('T')[0]}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Scores should be 0 or lower since assignments were created this week
      response.body.data.forEach(score => {
        if (testPersonIds.includes(score.person_id)) {
          expect(score.weekly_score).toBe(0);
        }
      });
    });

    test('should get current week info', async () => {
      const response = await request(app)
        .get('/api/scores/current-week')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        weekStart: expect.any(String),
        weekEnd: expect.any(String),
        weekNumber: expect.any(Number),
        year: expect.any(Number)
      });

      // Verify dates are valid
      const weekStart = new Date(response.body.data.weekStart);
      const weekEnd = new Date(response.body.data.weekEnd);
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(weekEnd.getTime()).toBeGreaterThan(weekStart.getTime());
    });
  });

  describe('Score Statistics', () => {
    test('should get score statistics', async () => {
      const response = await request(app)
        .get('/api/scores/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        totalPersons: expect.any(Number),
        averageTotalScore: expect.any(Number),
        averageWeeklyScore: expect.any(Number),
        highestTotalScore: expect.any(Number),
        lowestTotalScore: expect.any(Number),
        highestWeeklyScore: expect.any(Number),
        lowestWeeklyScore: expect.any(Number)
      });

      expect(response.body.data.totalPersons).toBeGreaterThanOrEqual(3);
      expect(response.body.data.highestTotalScore).toBeGreaterThanOrEqual(response.body.data.lowestTotalScore);
    });
  });

  describe('Score Trends and Comparisons', () => {
    test('should get person score trends', async () => {
      const personId = testPersonIds[0];

      const response = await request(app)
        .get(`/api/scores/person/${personId}/trends?weeks=4`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        person_id: personId,
        person_name: 'Score Test Person 1',
        trends: expect.any(Array)
      });

      expect(response.body.data.trends.length).toBeLessThanOrEqual(4);
      
      // Each trend entry should have week info and score
      response.body.data.trends.forEach(trend => {
        expect(trend).toMatchObject({
          weekStart: expect.any(String),
          weekEnd: expect.any(String),
          weeklyScore: expect.any(Number)
        });
      });
    });

    test('should compare scores between two persons', async () => {
      const person1Id = testPersonIds[0];
      const person2Id = testPersonIds[1];

      const response = await request(app)
        .get(`/api/scores/compare/${person1Id}/${person2Id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        person1: {
          person_id: person1Id,
          person_name: 'Score Test Person 1',
          total_score: 25,
          weekly_score: 25
        },
        person2: {
          person_id: person2Id,
          person_name: 'Score Test Person 2',
          total_score: 5,
          weekly_score: 5
        },
        comparison: {
          totalScoreDifference: 20, // 25 - 5
          weeklyScoreDifference: 20,
          leader: 'person1'
        }
      });
    });

    test('should handle comparison with non-existent person', async () => {
      const person1Id = testPersonIds[0];

      const response = await request(app)
        .get(`/api/scores/compare/${person1Id}/999999`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });
  });

  describe('Score Calculation Accuracy', () => {
    test('should accurately calculate scores after new assignments', async () => {
      const personId = testPersonIds[2];
      
      // Get initial score
      const initialResponse = await request(app)
        .get(`/api/scores/person/${personId}`)
        .expect(200);
      
      const initialScore = initialResponse.body.data.total_score;
      expect(initialScore).toBe(-15);

      // Add a new reward assignment
      const assignmentResponse = await request(app)
        .post('/api/assignments')
        .send({
          itemType: 'reward',
          itemId: testRewardIds[0], // +10 points
          personIds: [personId]
        });
      
      const newAssignmentId = assignmentResponse.body.data[0].id;
      testAssignmentIds.push(newAssignmentId);

      // Get updated score
      const updatedResponse = await request(app)
        .get(`/api/scores/person/${personId}`)
        .expect(200);
      
      const updatedScore = updatedResponse.body.data.total_score;
      expect(updatedScore).toBe(-5); // -15 + 10 = -5
    });

    test('should accurately calculate scores after assignment deletion', async () => {
      const personId = testPersonIds[0];
      
      // Get initial score
      const initialResponse = await request(app)
        .get(`/api/scores/person/${personId}`)
        .expect(200);
      
      const initialScore = initialResponse.body.data.total_score;

      // Delete one assignment (the punishment worth -5)
      const assignmentToDelete = testAssignmentIds.find(id => id); // Get first assignment
      
      await request(app)
        .delete(`/api/assignments/${assignmentToDelete}`)
        .expect(200);

      // Remove from our tracking array
      const index = testAssignmentIds.indexOf(assignmentToDelete);
      testAssignmentIds.splice(index, 1);

      // Get updated score
      const updatedResponse = await request(app)
        .get(`/api/scores/person/${personId}`)
        .expect(200);
      
      const updatedScore = updatedResponse.body.data.total_score;
      
      // Score should have increased (punishment removed)
      expect(updatedScore).toBeGreaterThan(initialScore);
    });

    test('should handle person with no assignments', async () => {
      // Create a new person with no assignments
      const newPersonResponse = await request(app)
        .post('/api/persons')
        .send({ name: 'Person With No Assignments' });
      
      const newPersonId = newPersonResponse.body.data.id;
      testPersonIds.push(newPersonId);

      const response = await request(app)
        .get(`/api/scores/person/${newPersonId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        person_id: newPersonId,
        total_score: 0,
        weekly_score: 0,
        assignment_count: 0
      });
    });
  });

  describe('Score Endpoint Error Handling', () => {
    test('should handle invalid person ID format', async () => {
      const response = await request(app)
        .get('/api/scores/person/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle invalid date format in weekly scores', async () => {
      const response = await request(app)
        .get('/api/scores/weekly?weekStart=invalid-date')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle invalid weeks parameter in trends', async () => {
      const personId = testPersonIds[0];

      const response = await request(app)
        .get(`/api/scores/person/${personId}/trends?weeks=invalid`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle comparison with same person ID', async () => {
      const personId = testPersonIds[0];

      const response = await request(app)
        .get(`/api/scores/compare/${personId}/${personId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('same person');
    });
  });
});