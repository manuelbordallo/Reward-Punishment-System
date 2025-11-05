/**
 * Integration Tests for Person Management Flow
 * Tests the complete flow of creating, updating, and managing persons
 * Requirements: 4.1-4.3, 5.1, 6.3
 */

// Mock the entire API module
jest.mock('../../src/services/api');

import { configureStore } from '@reduxjs/toolkit';
import personSlice, { fetchPersons, createPerson, updatePersonAsync, deletePerson } from '../../src/store/slices/personSlice';
import { Person } from '../../src/types';
import { apiService } from '../../src/services/api';

// Get the mocked version
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Create test store
const createTestStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      persons: personSlice,
    },
    preloadedState: {
      persons: {
        persons: [],
        loading: false,
        error: null,
        ...(initialState.persons || {}),
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

describe('Person Management Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Complete Person Creation Flow', () => {
    it('should successfully create a new person and update the store', async () => {
      const newPerson: Person = {
        id: 3,
        name: 'New Person',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiService.post.mockResolvedValue({
        success: true,
        data: newPerson,
      });

      const store = createTestStore();

      // Test: Dispatch create person action
      const result = await store.dispatch(createPerson({ name: 'New Person' }));

      // Verify: Action was successful
      expect(result.type).toBe('persons/createPerson/fulfilled');
      expect(result.payload).toEqual(newPerson);

      // Verify: Store state updated correctly
      const state = store.getState();
      expect(state.persons.persons).toHaveLength(1);
      expect(state.persons.persons[0]).toEqual(newPerson);
      expect(state.persons.loading).toBe(false);
      expect(state.persons.error).toBeNull();

      // Verify: API was called correctly
      expect(mockApiService.post).toHaveBeenCalledWith('/persons', { name: 'New Person' });
    });

    it('should handle person creation failure gracefully', async () => {
      // Setup: Mock API error response
      mockApiService.post.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name already exists',
        },
      });

      const store = createTestStore();

      // Test: Dispatch create person action with duplicate name
      const result = await store.dispatch(createPerson({ name: 'Duplicate Name' }));

      // Verify: Action was rejected
      expect(result.type).toBe('persons/createPerson/rejected');
      expect(result.payload).toBe('Name already exists');

      // Verify: Store state reflects error
      const state = store.getState();
      expect(state.persons.persons).toHaveLength(0);
      expect(state.persons.loading).toBe(false);
      expect(state.persons.error).toBe('Name already exists');
    });
  });

  describe('Person Update Flow', () => {
    it('should successfully update an existing person', async () => {
      // Setup: Store with existing person
      const existingPerson = mockPersons[0];
      const store = createTestStore({
        persons: {
          persons: [existingPerson],
          loading: false,
          error: null,
        },
      });

      const updatedPerson: Person = {
        ...existingPerson,
        name: 'Updated Name',
        updatedAt: new Date(),
      };

      mockApiService.put.mockResolvedValue({
        success: true,
        data: updatedPerson,
      });

      // Test: Dispatch update person action
      const result = await store.dispatch(updatePersonAsync(updatedPerson));

      // Verify: Action was successful
      expect(result.type).toBe('persons/updatePerson/fulfilled');
      expect(result.payload).toEqual(updatedPerson);

      // Verify: Store state updated correctly
      const state = store.getState();
      expect(state.persons.persons).toHaveLength(1);
      expect(state.persons.persons[0].name).toBe('Updated Name');
      expect(state.persons.loading).toBe(false);
      expect(state.persons.error).toBeNull();

      // Verify: API was called correctly
      expect(mockApiService.put).toHaveBeenCalledWith(`/persons/${existingPerson.id}`, updatedPerson);
    });
  });

  describe('Person Deletion Flow', () => {
    it('should successfully delete a person and remove from store', async () => {
      // Setup: Store with existing persons
      const store = createTestStore({
        persons: {
          persons: mockPersons,
          loading: false,
          error: null,
        },
      });

      mockApiService.delete.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // Test: Dispatch delete person action
      const personIdToDelete = mockPersons[0].id;
      const result = await store.dispatch(deletePerson(personIdToDelete));

      // Verify: Action was successful
      expect(result.type).toBe('persons/deletePerson/fulfilled');
      expect(result.payload).toBe(personIdToDelete);

      // Verify: Store state updated correctly
      const state = store.getState();
      expect(state.persons.persons).toHaveLength(1);
      expect(state.persons.persons[0].id).toBe(mockPersons[1].id);
      expect(state.persons.loading).toBe(false);
      expect(state.persons.error).toBeNull();

      // Verify: API was called correctly
      expect(mockApiService.delete).toHaveBeenCalledWith(`/persons/${personIdToDelete}`);
    });
  });

  describe('Person Fetch Flow', () => {
    it('should successfully fetch all persons and populate store', async () => {
      // Setup: Mock API response with mockPersons data
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPersons,
      });

      const store = createTestStore();

      // Test: Dispatch fetch persons action
      const result = await store.dispatch(fetchPersons());

      // Verify: Action was successful
      expect(result.type).toBe('persons/fetchPersons/fulfilled');
      expect(result.payload).toEqual(mockPersons);

      // Verify: Store state updated correctly
      const state = store.getState();
      expect(state.persons.persons).toHaveLength(2);
      expect(state.persons.persons).toEqual(mockPersons);
      expect(state.persons.loading).toBe(false);
      expect(state.persons.error).toBeNull();

      // Verify: API was called correctly
      expect(mockApiService.get).toHaveBeenCalledWith('/persons');
    });

    it('should handle fetch failure gracefully', async () => {
      // Setup: Mock API error response
      mockApiService.get.mockResolvedValue({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      });

      const store = createTestStore();

      // Test: Dispatch fetch persons action
      const result = await store.dispatch(fetchPersons());

      // Verify: Action was rejected
      expect(result.type).toBe('persons/fetchPersons/rejected');
      expect(result.payload).toBe('Failed to connect to server');

      // Verify: Store state reflects error
      const state = store.getState();
      expect(state.persons.persons).toHaveLength(0);
      expect(state.persons.loading).toBe(false);
      expect(state.persons.error).toBe('Failed to connect to server');
    });
  });

  describe('Complete Person Management Workflow', () => {
    it('should handle a complete CRUD workflow', async () => {
      const store = createTestStore();

      // Step 1: Fetch initial persons (empty)
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await store.dispatch(fetchPersons());
      expect(store.getState().persons.persons).toHaveLength(0);

      // Step 2: Create first person
      const person1: Person = {
        id: 1,
        name: 'Person 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: person1,
      });

      await store.dispatch(createPerson({ name: 'Person 1' }));
      expect(store.getState().persons.persons).toHaveLength(1);

      // Step 3: Create second person
      const person2: Person = {
        id: 2,
        name: 'Person 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: person2,
      });

      await store.dispatch(createPerson({ name: 'Person 2' }));
      expect(store.getState().persons.persons).toHaveLength(2);

      // Step 4: Update first person
      const updatedPerson1: Person = {
        ...person1,
        name: 'Updated Person 1',
        updatedAt: new Date(),
      };

      mockApiService.put.mockResolvedValueOnce({
        success: true,
        data: updatedPerson1,
      });

      await store.dispatch(updatePersonAsync(updatedPerson1));
      const stateAfterUpdate = store.getState();
      expect(stateAfterUpdate.persons.persons[0].name).toBe('Updated Person 1');

      // Step 5: Delete second person
      mockApiService.delete.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      await store.dispatch(deletePerson(person2.id));
      const finalState = store.getState();
      expect(finalState.persons.persons).toHaveLength(1);
      expect(finalState.persons.persons[0].id).toBe(person1.id);
    });
  });
});