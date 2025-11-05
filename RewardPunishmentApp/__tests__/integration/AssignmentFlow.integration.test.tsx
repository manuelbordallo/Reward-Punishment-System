/**
 * Integration Tests for Assignment Flow
 * Tests the complete flow of assigning rewards/punishments to persons
 * Requirements: 4.1-4.3, 5.1, 6.3
 */

import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import assignmentSlice, {
    fetchAssignments,
    createAssignment,
    deleteAssignment
} from '../../src/store/slices/assignmentSlice';
import personSlice from '../../src/store/slices/personSlice';
import rewardSlice from '../../src/store/slices/rewardSlice';
import punishmentSlice from '../../src/store/slices/punishmentSlice';
import { apiService } from '../../src/services/api';
import { Assignment, Person, Reward, Punishment } from '../../src/types';

// Mock the API service
jest.mock('../../src/services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Create test store with all necessary slices
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            assignments: assignmentSlice,
            persons: personSlice,
            rewards: rewardSlice,
            punishments: punishmentSlice,
        },
        preloadedState: {
            assignments: {
                assignments: [],
                scores: [],
                loading: false,
                error: null,
                ...initialState.assignments,
            },
            persons: {
                persons: [],
                loading: false,
                error: null,
                ...initialState.persons,
            },
            rewards: {
                rewards: [],
                loading: false,
                error: null,
                ...initialState.rewards,
            },
            punishments: {
                punishments: [],
                loading: false,
                error: null,
                ...initialState.punishments,
            },
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false, // Disable serializable check to allow Date objects
            }),
    });
};

// Mock data
const mockPersons: Person[] = [
    {
        id: 1,
        name: 'John Doe',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    },
    {
        id: 2,
        name: 'Jane Smith',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
    },
];

const mockRewards: Reward[] = [
    {
        id: 1,
        name: 'Good Behavior',
        value: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    },
    {
        id: 2,
        name: 'Excellent Work',
        value: 20,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    },
];

const mockPunishments: Punishment[] = [
    {
        id: 1,
        name: 'Late Arrival',
        value: -5,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    },
    {
        id: 2,
        name: 'Missed Deadline',
        value: -15,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    },
];

describe('Assignment Flow Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Reward Assignment Flow', () => {
        it('should successfully assign a reward to a single person', async () => {
            // Setup: Store with existing data
            const store = createTestStore({
                persons: { persons: mockPersons },
                rewards: { rewards: mockRewards },
            });

            const newAssignment: Assignment = {
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
                data: [newAssignment],
            });

            // Test: Create assignment
            const result = await store.dispatch(createAssignment({
                personIds: [1],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
            }));

            // Verify: Action was successful
            expect(result.type).toBe('assignments/createAssignment/fulfilled');
            expect(result.payload).toEqual([newAssignment]);

            // Verify: Store state updated correctly
            const state = store.getState();
            expect(state.assignments.assignments).toHaveLength(1);
            expect(state.assignments.assignments[0]).toEqual(newAssignment);
            expect(state.assignments.loading).toBe(false);
            expect(state.assignments.error).toBeNull();

            // Verify: API was called correctly
            expect(mockApiService.post).toHaveBeenCalledWith('/assignments', {
                personIds: [1],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
            });
        });

        it('should successfully assign a reward to multiple persons', async () => {
            // Setup: Store with existing data
            const store = createTestStore({
                persons: { persons: mockPersons },
                rewards: { rewards: mockRewards },
            });

            const assignments: Assignment[] = [
                {
                    id: 1,
                    personId: 1,
                    itemType: 'reward',
                    itemId: 1,
                    itemName: 'Good Behavior',
                    itemValue: 10,
                    assignedAt: new Date(),
                },
                {
                    id: 2,
                    personId: 2,
                    itemType: 'reward',
                    itemId: 1,
                    itemName: 'Good Behavior',
                    itemValue: 10,
                    assignedAt: new Date(),
                },
            ];

            mockApiService.post.mockResolvedValueOnce({
                success: true,
                data: assignments,
            });

            // Test: Create assignment for multiple persons
            const result = await store.dispatch(createAssignment({
                personIds: [1, 2],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
            }));

            // Verify: Action was successful
            expect(result.type).toBe('assignments/createAssignment/fulfilled');
            expect(result.payload).toEqual(assignments);

            // Verify: Store state updated correctly
            const state = store.getState();
            expect(state.assignments.assignments).toHaveLength(2);
            expect(state.assignments.assignments).toEqual(assignments);

            // Verify: API was called correctly
            expect(mockApiService.post).toHaveBeenCalledWith('/assignments', {
                personIds: [1, 2],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
            });
        });
    });

    describe('Punishment Assignment Flow', () => {
        it('should successfully assign a punishment to a person', async () => {
            // Setup: Store with existing data
            const store = createTestStore({
                persons: { persons: mockPersons },
                punishments: { punishments: mockPunishments },
            });

            const newAssignment: Assignment = {
                id: 1,
                personId: 1,
                itemType: 'punishment',
                itemId: 1,
                itemName: 'Late Arrival',
                itemValue: -5,
                assignedAt: new Date(),
            };

            mockApiService.post.mockResolvedValueOnce({
                success: true,
                data: [newAssignment],
            });

            // Test: Create punishment assignment
            const result = await store.dispatch(createAssignment({
                personIds: [1],
                itemType: 'punishment',
                itemId: 1,
                itemName: 'Late Arrival',
                itemValue: -5,
            }));

            // Verify: Action was successful
            expect(result.type).toBe('assignments/createAssignment/fulfilled');
            expect(result.payload).toEqual([newAssignment]);

            // Verify: Store state updated correctly
            const state = store.getState();
            expect(state.assignments.assignments).toHaveLength(1);
            expect(state.assignments.assignments[0]).toEqual(newAssignment);
            expect(state.assignments.assignments[0].itemValue).toBe(-5);

            // Verify: API was called correctly
            expect(mockApiService.post).toHaveBeenCalledWith('/assignments', {
                personIds: [1],
                itemType: 'punishment',
                itemId: 1,
                itemName: 'Late Arrival',
                itemValue: -5,
            });
        });
    });

    describe('Assignment Deletion Flow', () => {
        it('should successfully delete an assignment', async () => {
            // Setup: Store with existing assignment
            const existingAssignment: Assignment = {
                id: 1,
                personId: 1,
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
                assignedAt: new Date(),
            };

            const store = createTestStore({
                assignments: {
                    assignments: [existingAssignment],
                },
            });

            mockApiService.delete.mockResolvedValueOnce({
                success: true,
                data: undefined,
            });

            // Test: Delete assignment
            const result = await store.dispatch(deleteAssignment(1));

            // Verify: Action was successful
            expect(result.type).toBe('assignments/deleteAssignment/fulfilled');
            expect(result.payload).toBe(1);

            // Verify: Store state updated correctly
            const state = store.getState();
            expect(state.assignments.assignments).toHaveLength(0);

            // Verify: API was called correctly
            expect(mockApiService.delete).toHaveBeenCalledWith('/assignments/1');
        });
    });

    describe('Assignment Fetch Flow', () => {
        it('should successfully fetch all assignments', async () => {
            // Setup: Mock API response
            const mockAssignments: Assignment[] = [
                {
                    id: 1,
                    personId: 1,
                    itemType: 'reward',
                    itemId: 1,
                    itemName: 'Good Behavior',
                    itemValue: 10,
                    assignedAt: new Date('2023-01-01'),
                },
                {
                    id: 2,
                    personId: 2,
                    itemType: 'punishment',
                    itemId: 1,
                    itemName: 'Late Arrival',
                    itemValue: -5,
                    assignedAt: new Date('2023-01-02'),
                },
            ];

            mockApiService.get.mockResolvedValueOnce({
                success: true,
                data: mockAssignments,
            });

            const store = createTestStore();

            // Test: Fetch assignments
            const result = await store.dispatch(fetchAssignments());

            // Verify: Action was successful
            expect(result.type).toBe('assignments/fetchAssignments/fulfilled');
            expect(result.payload).toEqual(mockAssignments);

            // Verify: Store state updated correctly
            const state = store.getState();
            expect(state.assignments.assignments).toHaveLength(2);
            expect(state.assignments.assignments).toEqual(mockAssignments);

            // Verify: API was called correctly
            expect(mockApiService.get).toHaveBeenCalledWith('/assignments');
        });
    });

    describe('Complete Assignment Workflow', () => {
        it('should handle a complete assignment workflow with mixed rewards and punishments', async () => {
            const store = createTestStore({
                persons: { persons: mockPersons },
                rewards: { rewards: mockRewards },
                punishments: { punishments: mockPunishments },
            });

            // Step 1: Fetch initial assignments (empty)
            mockApiService.get.mockResolvedValueOnce({
                success: true,
                data: [],
            });

            await store.dispatch(fetchAssignments());
            expect(store.getState().assignments.assignments).toHaveLength(0);

            // Step 2: Assign reward to person 1
            const rewardAssignment: Assignment = {
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
                data: [rewardAssignment],
            });

            await store.dispatch(createAssignment({
                personIds: [1],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
            }));

            expect(store.getState().assignments.assignments).toHaveLength(1);

            // Step 3: Assign punishment to person 2
            const punishmentAssignment: Assignment = {
                id: 2,
                personId: 2,
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
                personIds: [2],
                itemType: 'punishment',
                itemId: 1,
                itemName: 'Late Arrival',
                itemValue: -5,
            }));

            expect(store.getState().assignments.assignments).toHaveLength(2);

            // Step 4: Assign reward to multiple persons
            const multipleAssignments: Assignment[] = [
                {
                    id: 3,
                    personId: 1,
                    itemType: 'reward',
                    itemId: 2,
                    itemName: 'Excellent Work',
                    itemValue: 20,
                    assignedAt: new Date(),
                },
                {
                    id: 4,
                    personId: 2,
                    itemType: 'reward',
                    itemId: 2,
                    itemName: 'Excellent Work',
                    itemValue: 20,
                    assignedAt: new Date(),
                },
            ];

            mockApiService.post.mockResolvedValueOnce({
                success: true,
                data: multipleAssignments,
            });

            await store.dispatch(createAssignment({
                personIds: [1, 2],
                itemType: 'reward',
                itemId: 2,
                itemName: 'Excellent Work',
                itemValue: 20,
            }));

            expect(store.getState().assignments.assignments).toHaveLength(4);

            // Step 5: Delete an assignment
            mockApiService.delete.mockResolvedValueOnce({
                success: true,
                data: undefined,
            });

            await store.dispatch(deleteAssignment(2));

            const finalState = store.getState();
            expect(finalState.assignments.assignments).toHaveLength(3);
            expect(finalState.assignments.assignments.find(a => a.id === 2)).toBeUndefined();
        });

        it('should handle assignment validation errors', async () => {
            const store = createTestStore();

            // Test: Try to create assignment with empty person list
            mockApiService.post.mockResolvedValueOnce({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'At least one person must be selected',
                },
            });

            const result = await store.dispatch(createAssignment({
                personIds: [],
                itemType: 'reward',
                itemId: 1,
                itemName: 'Good Behavior',
                itemValue: 10,
            }));

            // Verify: Action was rejected
            expect(result.type).toBe('assignments/createAssignment/rejected');
            expect(result.payload).toBe('At least one person must be selected');

            // Verify: Store state reflects error
            const state = store.getState();
            expect(state.assignments.assignments).toHaveLength(0);
            expect(state.assignments.error).toBe('At least one person must be selected');
        });
    });
});