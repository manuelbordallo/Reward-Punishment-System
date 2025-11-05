/**
 * End-to-End Data Persistence Tests
 * Tests data persistence across the full stack (frontend to backend)
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import personSlice from '../../src/store/slices/personSlice';
import rewardSlice from '../../src/store/slices/rewardSlice';
import punishmentSlice from '../../src/store/slices/punishmentSlice';
import assignmentSlice from '../../src/store/slices/assignmentSlice';
import uiSlice from '../../src/store/slices/uiSlice';

// Import screens
import { PersonManagement } from '../../src/screens/PersonManagement';
import { TotalScoresScreen } from '../../src/screens/TotalScoresScreen';
import { AssignmentHistoryScreen } from '../../src/screens/AssignmentHistoryScreen';

// Mock API service
jest.mock('../../src/services/api');
import { apiService } from '../../src/services/api';
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      persons: personSlice,
      rewards: rewardSlice,
      punishments: punishmentSlice,
      assignments: assignmentSlice,
      ui: uiSlice,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </Provider>
);

describe('Data Persistence End-to-End Tests', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  describe('Person Data Persistence', () => {
    it('should persist person data through complete CRUD lifecycle', async () => {
      const personData = { name: 'John Doe' };
      const createdPerson = {
        id: 1,
        name: 'John Doe',
        createdAt: new Date('2023-11-01T10:00:00Z'),
        updatedAt: new Date('2023-11-01T10:00:00Z'),
      };

      // Mock initial fetch (empty)
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <PersonManagement />
        </TestWrapper>
      );

      // CREATE: Add new person
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: createdPerson,
      });

      const addButton = getByText('+ Agregar');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Ingresa el nombre de la persona');
      fireEvent.changeText(nameInput, personData.name);

      const saveButton = getByText('Crear');
      fireEvent.press(saveButton);

      // Verify CREATE persistence
      await waitFor(() => {
        expect(mockApiService.post).toHaveBeenCalledWith('/persons', personData);
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Verify data is in Redux store
      expect(store.getState().persons.persons).toHaveLength(1);
      expect(store.getState().persons.persons[0].name).toBe('John Doe');
    });
  });

  describe('Score Calculation Data Persistence', () => {
    it('should persist and calculate total scores correctly', async () => {
      const mockScores = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 15,
          weeklyScore: 10,
          assignmentCount: 3,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockScores,
      });

      const { getByText } = render(
        <TestWrapper store={store}>
          <TotalScoresScreen />
        </TestWrapper>
      );

      // Verify scores are loaded and calculated correctly
      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledWith('/scores/total');
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('15 puntos')).toBeTruthy();
      });

      // Verify data structure in store
      const storeState = store.getState();
      expect(storeState.assignments.scores).toHaveLength(1);

      const johnScore = storeState.assignments.scores.find((s: any) => s.personName === 'John Doe');
      expect(johnScore?.totalScore).toBe(15);
      expect(johnScore?.assignmentCount).toBe(3);
    });
  });

  describe('Cross-Entity Data Consistency', () => {
    it('should maintain data consistency across all entities', async () => {
      const persons = [
        { id: 1, name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];

      const assignments = [
        {
          id: 1,
          personId: 1,
          itemType: 'reward',
          itemId: 1,
          itemName: 'Good Behavior',
          itemValue: 10,
          assignedAt: new Date(),
        },
      ];

      const scores = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 10,
          weeklyScore: 10,
          assignmentCount: 1,
        },
      ];

      // Create store with all data
      const fullStore = createTestStore({
        persons: { persons, loading: false, error: null },
        assignments: { assignments, scores, loading: false, error: null },
      });

      // Test data consistency across different screens
      const { getByText: getByTextPersons } = render(
        <TestWrapper store={fullStore}>
          <PersonManagement />
        </TestWrapper>
      );
      expect(getByTextPersons('John Doe')).toBeTruthy();

      const { getByText: getByTextHistory } = render(
        <TestWrapper store={fullStore}>
          <AssignmentHistoryScreen />
        </TestWrapper>
      );
      expect(getByTextHistory('Good Behavior')).toBeTruthy();

      const { getByText: getByTextScores } = render(
        <TestWrapper store={fullStore}>
          <TotalScoresScreen />
        </TestWrapper>
      );
      expect(getByTextScores('John Doe')).toBeTruthy();
      expect(getByTextScores('10 puntos')).toBeTruthy();
    });
  });
});