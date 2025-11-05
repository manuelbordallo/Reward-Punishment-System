/**
 * Integration Tests for Score Calculation Flow
 * Tests the complete flow of calculating total and weekly scores
 * Requirements: 4.1-4.3, 5.1, 6.3
 */

import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import assignmentSlice, {
  fetchTotalScores,
  fetchWeeklyScores,
  createAssignment,
  deleteAssignment
} from '../../src/store/slices/assignmentSlice';
import { apiService } from '../../src/services/api';
import { PersonScore, Assignment } from '../../src/types';

// Mock the API service
jest.mock('../../src/services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      assignments: assignmentSlice,
    },
    preloadedState: {
      assignments: {
        assignments: [],
        scores: [],
        loading: false,
        error: null,
        ...initialState.assignments,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable serializable check to allow Date objects
      }),
  });
};

// Mock data
const mockAssignments: Assignment[] = [
  {
    id: 1,
    personId: 1,
    itemType: 'reward',
    itemId: 1,
    itemName: 'Good Behavior',
    itemValue: 10,
    assignedAt: new Date('2023-11-01T10:00:00Z'), // Current week
  },
  {
    id: 2,
    personId: 1,
    itemType: 'punishment',
    itemId: 1,
    itemName: 'Late Arrival',
    itemValue: -5,
    assignedAt: new Date('2023-11-02T14:00:00Z'), // Current week
  },
  {
    id: 3,
    personId: 2,
    itemType: 'reward',
    itemId: 2,
    itemName: 'Excellent Work',
    itemValue: 20,
    assignedAt: new Date('2023-11-03T09:00:00Z'), // Current week
  },
  {
    id: 4,
    personId: 1,
    itemType: 'reward',
    itemId: 1,
    itemName: 'Good Behavior',
    itemValue: 10,
    assignedAt: new Date('2023-10-25T10:00:00Z'), // Previous week
  },
];

const mockTotalScores: PersonScore[] = [
  {
    personId: 1,
    personName: 'John Doe',
    totalScore: 15, // 10 - 5 + 10 = 15
    weeklyScore: 5, // 10 - 5 = 5 (current week only)
    assignmentCount: 3,
  },
  {
    personId: 2,
    personName: 'Jane Smith',
    totalScore: 20, // 20
    weeklyScore: 20, // 20 (current week only)
    assignmentCount: 1,
  },
];

const mockWeeklyScores: PersonScore[] = [
  {
    personId: 1,
    personName: 'John Doe',
    totalScore: 15,
    weeklyScore: 5, // 10 - 5 = 5 (current week only)
    assignmentCount: 2,
  },
  {
    personId: 2,
    personName: 'Jane Smith',
    totalScore: 20,
    weeklyScore: 20, // 20 (current week only)
    assignmentCount: 1,
  },
];

describe('Score Calculation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Total Score Calculation Flow', () => {
    it('should successfully fetch and calculate total scores', async () => {
      // Setup: Mock API response
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockTotalScores,
      });

      const store = createTestStore();

      // Test: Fetch total scores
      const result = await store.dispatch(fetchTotalScores());

      // Verify: Action was successful
      expect(result.type).toBe('assignments/fetchTotalScores/fulfilled');
      expect(result.payload).toEqual(mockTotalScores);

      // Verify: Store state updated correctly
      const state = store.getState();
      expect(state.assignments.scores).toEqual(mockTotalScores);
      expect(state.assignments.loading).toBe(false);
      expect(state.assignments.error).toBeNull();

      // Verify: API was called correctly
      expect(mockApiService.get).toHaveBeenCalledWith('/scores/total');
    });

    it('should handle total score calculation with mixed rewards and punishments', async () => {
      // Setup: Mock scores that reflect mixed assignments
      const mixedScores: PersonScore[] = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 5, // Multiple rewards and punishments
          weeklyScore: 5,
          assignmentCount: 4,
        },
        {
          personId: 2,
          personName: 'Jane Smith',
          totalScore: -10, // More punishments than rewards
          weeklyScore: -5,
          assignmentCount: 3,
        },
        {
          personId: 3,
          personName: 'Bob Wilson',
          totalScore: 50, // Only rewards
          weeklyScore: 25,
          assignmentCount: 2,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mixedScores,
      });

      const store = createTestStore();

      // Test: Fetch total scores
      const result = await store.dispatch(fetchTotalScores());

      // Verify: Scores reflect correct calculations
      expect(result.payload).toEqual(mixedScores);

      const state = store.getState();
      expect(state.assignments.scores).toEqual(mixedScores);

      // Verify: Scores are properly ordered and calculated
      const johnScore = state.assignments.scores.find(s => s.personName === 'John Doe');
      const janeScore = state.assignments.scores.find(s => s.personName === 'Jane Smith');
      const bobScore = state.assignments.scores.find(s => s.personName === 'Bob Wilson');

      expect(johnScore?.totalScore).toBe(5);
      expect(janeScore?.totalScore).toBe(-10);
      expect(bobScore?.totalScore).toBe(50);
    });
  });

  describe('Weekly Score Calculation Flow', () => {
    it('should successfully fetch and calculate weekly scores', async () => {
      // Setup: Mock API response
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockWeeklyScores,
      });

      const store = createTestStore();

      // Test: Fetch weekly scores
      const result = await store.dispatch(fetchWeeklyScores());

      // Verify: Action was successful
      expect(result.type).toBe('assignments/fetchWeeklyScores/fulfilled');
      expect(result.payload).toEqual(mockWeeklyScores);

      // Verify: Store state updated correctly
      const state = store.getState();
      expect(state.assignments.scores).toEqual(mockWeeklyScores);
      expect(state.assignments.loading).toBe(false);
      expect(state.assignments.error).toBeNull();

      // Verify: API was called correctly
      expect(mockApiService.get).toHaveBeenCalledWith('/scores/weekly');
    });

    it('should correctly filter assignments for current week only', async () => {
      // Setup: Mock weekly scores that should exclude previous week assignments
      const currentWeekScores: PersonScore[] = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 15, // Total includes all assignments
          weeklyScore: 5, // Weekly excludes previous week assignment (10)
          assignmentCount: 2, // Only current week assignments
        },
        {
          personId: 2,
          personName: 'Jane Smith',
          totalScore: 20,
          weeklyScore: 20, // Same as total (all assignments in current week)
          assignmentCount: 1,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: currentWeekScores,
      });

      const store = createTestStore();

      // Test: Fetch weekly scores
      const result = await store.dispatch(fetchWeeklyScores());

      // Verify: Weekly scores are different from total scores for person 1
      const johnWeeklyScore = result.payload.find(s => s.personName === 'John Doe');
      expect(johnWeeklyScore?.weeklyScore).toBe(5); // Current week only
      expect(johnWeeklyScore?.totalScore).toBe(15); // All time
      expect(johnWeeklyScore?.assignmentCount).toBe(2); // Current week assignments only
    });
  });

  describe('Score Recalculation on Assignment Changes', () => {
    it('should trigger score recalculation when new assignment is created', async () => {
      // Setup: Store with existing scores
      const store = createTestStore({
        assignments: {
          scores: mockTotalScores,
          assignments: mockAssignments,
        },
      });

      // Step 1: Create new assignment
      const newAssignment: Assignment = {
        id: 5,
        personId: 1,
        itemType: 'reward',
        itemId: 3,
        itemName: 'Outstanding Performance',
        itemValue: 25,
        assignedAt: new Date(),
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: [newAssignment],
      });

      await store.dispatch(createAssignment({
        personIds: [1],
        itemType: 'reward',
        itemId: 3,
        itemName: 'Outstanding Performance',
        itemValue: 25,
      }));

      // Verify: Assignment was added to store
      const stateAfterCreate = store.getState();
      expect(stateAfterCreate.assignments.assignments).toHaveLength(5);

      // Step 2: Fetch updated scores
      const updatedScores: PersonScore[] = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 40, // Previous 15 + new 25 = 40
          weeklyScore: 30, // Previous 5 + new 25 = 30
          assignmentCount: 4,
        },
        {
          personId: 2,
          personName: 'Jane Smith',
          totalScore: 20, // Unchanged
          weeklyScore: 20, // Unchanged
          assignmentCount: 1,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: updatedScores,
      });

      await store.dispatch(fetchTotalScores());

      // Verify: Scores were updated correctly
      const finalState = store.getState();
      const johnUpdatedScore = finalState.assignments.scores.find(s => s.personName === 'John Doe');
      expect(johnUpdatedScore?.totalScore).toBe(40);
      expect(johnUpdatedScore?.weeklyScore).toBe(30);
    });

    it('should trigger score recalculation when assignment is deleted', async () => {
      // Setup: Store with existing assignments and scores
      const store = createTestStore({
        assignments: {
          assignments: mockAssignments,
          scores: mockTotalScores,
        },
      });

      // Step 1: Delete an assignment
      mockApiService.delete.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      await store.dispatch(deleteAssignment(2)); // Delete punishment (-5)

      // Verify: Assignment was removed from store
      const stateAfterDelete = store.getState();
      expect(stateAfterDelete.assignments.assignments).toHaveLength(3);
      expect(stateAfterDelete.assignments.assignments.find(a => a.id === 2)).toBeUndefined();

      // Step 2: Fetch updated scores
      const updatedScores: PersonScore[] = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 20, // Previous 15 + removed punishment 5 = 20
          weeklyScore: 10, // Previous 5 + removed punishment 5 = 10
          assignmentCount: 2,
        },
        {
          personId: 2,
          personName: 'Jane Smith',
          totalScore: 20, // Unchanged
          weeklyScore: 20, // Unchanged
          assignmentCount: 1,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: updatedScores,
      });

      await store.dispatch(fetchTotalScores());

      // Verify: Scores were updated correctly after deletion
      const finalState = store.getState();
      const johnUpdatedScore = finalState.assignments.scores.find(s => s.personName === 'John Doe');
      expect(johnUpdatedScore?.totalScore).toBe(20);
      expect(johnUpdatedScore?.weeklyScore).toBe(10);
    });
  });

  describe('Score Calculation Error Handling', () => {
    it('should handle score calculation failures gracefully', async () => {
      // Setup: Mock API error response
      mockApiService.get.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate scores',
        },
      });

      const store = createTestStore();

      // Test: Attempt to fetch scores
      const result = await store.dispatch(fetchTotalScores());

      // Verify: Action was rejected
      expect(result.type).toBe('assignments/fetchTotalScores/rejected');
      expect(result.payload).toBe('Failed to calculate scores');

      // Verify: Store state reflects error
      const state = store.getState();
      expect(state.assignments.scores).toHaveLength(0);
      expect(state.assignments.error).toBe('Failed to calculate scores');
      expect(state.assignments.loading).toBe(false);
    });
  });

  describe('Complete Score Calculation Workflow', () => {
    it('should handle a complete score calculation workflow with real-time updates', async () => {
      const store = createTestStore();

      // Step 1: Initial fetch (empty scores)
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await store.dispatch(fetchTotalScores());
      expect(store.getState().assignments.scores).toHaveLength(0);

      // Step 2: Add first assignment
      const firstAssignment: Assignment = {
        id: 1,
        personId: 1,
        itemType: 'reward',
        itemId: 1,
        itemName: 'Good Behavior',
        itemValue: 10,
        assignedAt: new Date(),
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: [firstAssignment],
      });

      await store.dispatch(createAssignment({
        personIds: [1],
        itemType: 'reward',
        itemId: 1,
        itemName: 'Good Behavior',
        itemValue: 10,
      }));

      // Step 3: Fetch updated scores after first assignment
      const scoresAfterFirst: PersonScore[] = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 10,
          weeklyScore: 10,
          assignmentCount: 1,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: scoresAfterFirst,
      });

      await store.dispatch(fetchTotalScores());
      expect(store.getState().assignments.scores[0].totalScore).toBe(10);

      // Step 4: Add punishment
      const punishmentAssignment: Assignment = {
        id: 2,
        personId: 1,
        itemType: 'punishment',
        itemId: 1,
        itemName: 'Late Arrival',
        itemValue: -5,
        assignedAt: new Date(),
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: [punishmentAssignment],
      });

      await store.dispatch(createAssignment({
        personIds: [1],
        itemType: 'punishment',
        itemId: 1,
        itemName: 'Late Arrival',
        itemValue: -5,
      }));

      // Step 5: Fetch final scores
      const finalScores: PersonScore[] = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 5, // 10 - 5 = 5
          weeklyScore: 5,
          assignmentCount: 2,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: finalScores,
      });

      await store.dispatch(fetchTotalScores());

      // Verify: Final scores are correct
      const finalState = store.getState();
      expect(finalState.assignments.scores[0].totalScore).toBe(5);
      expect(finalState.assignments.assignments).toHaveLength(2);
    });
  });
});