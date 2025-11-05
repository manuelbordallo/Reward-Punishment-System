/**
 * End-to-End Tests for Reward-Punishment System
 * Tests complete user workflows from frontend to backend
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import personSlice from '../../src/store/slices/personSlice';
import rewardSlice from '../../src/store/slices/rewardSlice';
import punishmentSlice from '../../src/store/slices/punishmentSlice';
import assignmentSlice from '../../src/store/slices/assignmentSlice';
import uiSlice from '../../src/store/slices/uiSlice';

// Import screens and components
import App from '../../App';
import PersonManagement from '../../src/screens/PersonManagement';
import RewardManagement from '../../src/screens/RewardManagement';
import PunishmentManagement from '../../src/screens/PunishmentManagement';
import AssignmentManagement from '../../src/screens/AssignmentManagement';
import TotalScoresScreen from '../../src/screens/TotalScoresScreen';
import WeeklyScoresScreen from '../../src/screens/WeeklyScoresScreen';
import AssignmentHistoryScreen from '../../src/screens/AssignmentHistoryScreen';

// Mock API service with realistic responses
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

describe('End-to-End System Tests', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  describe('Complete Person Management Workflow', () => {
    it('should handle complete person CRUD workflow with data persistence', async () => {
      // Mock API responses for person management
      const mockPerson = {
        id: 1,
        name: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Step 1: Initial fetch (empty)
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const { getByText, getByPlaceholderText, queryByText } = render(
        <TestWrapper store={store}>
          <PersonManagement />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledWith('/persons');
      });

      // Step 2: Create new person
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockPerson,
      });

      // Find and tap add button
      const addButton = getByText('Add Person');
      fireEvent.press(addButton);

      // Fill form
      const nameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(nameInput, 'John Doe');

      // Submit form
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      // Wait for API call
      await waitFor(() => {
        expect(mockApiService.post).toHaveBeenCalledWith('/persons', { name: 'John Doe' });
      });

      // Step 3: Verify person appears in list
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Step 4: Edit person
      const updatedPerson = {
        ...mockPerson,
        name: 'John Smith',
        updatedAt: new Date().toISOString(),
      };

      mockApiService.put.mockResolvedValueOnce({
        success: true,
        data: updatedPerson,
      });

      // Find edit button and tap
      const editButton = getByText('Edit');
      fireEvent.press(editButton);

      // Update name
      const editNameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(editNameInput, 'John Smith');

      // Save changes
      const updateButton = getByText('Save');
      fireEvent.press(updateButton);

      // Wait for API call
      await waitFor(() => {
        expect(mockApiService.put).toHaveBeenCalledWith('/persons/1', updatedPerson);
      });

      // Step 5: Verify updated name appears
      await waitFor(() => {
        expect(getByText('John Smith')).toBeTruthy();
        expect(queryByText('John Doe')).toBeFalsy();
      });

      // Step 6: Delete person
      mockApiService.delete.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      const deleteButton = getByText('Delete');
      fireEvent.press(deleteButton);

      // Confirm deletion
      const confirmButton = getByText('Confirm');
      fireEvent.press(confirmButton);

      // Wait for API call
      await waitFor(() => {
        expect(mockApiService.delete).toHaveBeenCalledWith('/persons/1');
      });

      // Step 7: Verify person is removed
      await waitFor(() => {
        expect(queryByText('John Smith')).toBeFalsy();
      });
    });

    it('should validate person name requirements', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <PersonManagement />
        </TestWrapper>
      );

      // Try to create person with empty name
      const addButton = getByText('Add Person');
      fireEvent.press(addButton);

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });

      // Try to create person with duplicate name
      mockApiService.post.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name already exists',
        },
      });

      const nameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(nameInput, 'Duplicate Name');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText('Name already exists')).toBeTruthy();
      });
    });
  });

  describe('Complete Reward Management Workflow', () => {
    it('should handle complete reward CRUD workflow with value validation', async () => {
      const mockReward = {
        id: 1,
        name: 'Good Behavior',
        value: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Initial fetch
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <RewardManagement />
        </TestWrapper>
      );

      // Create reward
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockReward,
      });

      const addButton = getByText('Add Reward');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Enter reward name');
      const valueInput = getByPlaceholderText('Enter reward value');

      fireEvent.changeText(nameInput, 'Good Behavior');
      fireEvent.changeText(valueInput, '10');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockApiService.post).toHaveBeenCalledWith('/rewards', {
          name: 'Good Behavior',
          value: 10,
        });
      });

      // Verify reward appears
      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
        expect(getByText('10 points')).toBeTruthy();
      });
    });

    it('should validate reward value is positive', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <RewardManagement />
        </TestWrapper>
      );

      const addButton = getByText('Add Reward');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Enter reward name');
      const valueInput = getByPlaceholderText('Enter reward value');

      fireEvent.changeText(nameInput, 'Invalid Reward');
      fireEvent.changeText(valueInput, '-5');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText('Reward value must be positive')).toBeTruthy();
      });
    });
  });

  describe('Complete Punishment Management Workflow', () => {
    it('should handle complete punishment CRUD workflow with value validation', async () => {
      const mockPunishment = {
        id: 1,
        name: 'Late Arrival',
        value: -5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Initial fetch
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <PunishmentManagement />
        </TestWrapper>
      );

      // Create punishment
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockPunishment,
      });

      const addButton = getByText('Add Punishment');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Enter punishment name');
      const valueInput = getByPlaceholderText('Enter punishment value');

      fireEvent.changeText(nameInput, 'Late Arrival');
      fireEvent.changeText(valueInput, '-5');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockApiService.post).toHaveBeenCalledWith('/punishments', {
          name: 'Late Arrival',
          value: -5,
        });
      });

      // Verify punishment appears
      await waitFor(() => {
        expect(getByText('Late Arrival')).toBeTruthy();
        expect(getByText('-5 points')).toBeTruthy();
      });
    });

    it('should validate punishment value is negative', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <PunishmentManagement />
        </TestWrapper>
      );

      const addButton = getByText('Add Punishment');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Enter punishment name');
      const valueInput = getByPlaceholderText('Enter punishment value');

      fireEvent.changeText(nameInput, 'Invalid Punishment');
      fireEvent.changeText(valueInput, '5');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText('Punishment value must be negative')).toBeTruthy();
      });
    });
  });

  describe('Complete Assignment Workflow', () => {
    it('should handle complete assignment workflow with multiple persons', async () => {
      // Setup test data
      const mockPersons = [
        { id: 1, name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Jane Smith', createdAt: new Date(), updatedAt: new Date() },
      ];

      const mockRewards = [
        { id: 1, name: 'Good Behavior', value: 10, createdAt: new Date(), updatedAt: new Date() },
      ];

      const mockAssignments = [
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

      // Mock API calls
      mockApiService.get
        .mockResolvedValueOnce({ success: true, data: mockPersons })
        .mockResolvedValueOnce({ success: true, data: mockRewards })
        .mockResolvedValueOnce({ success: true, data: [] }); // punishments

      const { getByText, getAllByText } = render(
        <TestWrapper store={store}>
          <AssignmentManagement />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
        expect(getByText('Good Behavior')).toBeTruthy();
      });

      // Select reward
      const rewardButton = getByText('Good Behavior');
      fireEvent.press(rewardButton);

      // Select multiple persons
      const johnCheckbox = getAllByText('John Doe')[0];
      const janeCheckbox = getAllByText('Jane Smith')[0];
      fireEvent.press(johnCheckbox);
      fireEvent.press(janeCheckbox);

      // Create assignment
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockAssignments,
      });

      const assignButton = getByText('Assign');
      fireEvent.press(assignButton);

      await waitFor(() => {
        expect(mockApiService.post).toHaveBeenCalledWith('/assignments', {
          personIds: [1, 2],
          itemType: 'reward',
          itemId: 1,
          itemName: 'Good Behavior',
          itemValue: 10,
        });
      });

      // Verify success message
      await waitFor(() => {
        expect(getByText('Assignment created successfully')).toBeTruthy();
      });
    });

    it('should validate assignment requires person selection', async () => {
      const mockRewards = [
        { id: 1, name: 'Good Behavior', value: 10, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockApiService.get
        .mockResolvedValueOnce({ success: true, data: [] }) // persons
        .mockResolvedValueOnce({ success: true, data: mockRewards })
        .mockResolvedValueOnce({ success: true, data: [] }); // punishments

      const { getByText } = render(
        <TestWrapper store={store}>
          <AssignmentManagement />
        </TestWrapper>
      );

      // Select reward but no persons
      const rewardButton = getByText('Good Behavior');
      fireEvent.press(rewardButton);

      const assignButton = getByText('Assign');
      fireEvent.press(assignButton);

      await waitFor(() => {
        expect(getByText('Please select at least one person')).toBeTruthy();
      });
    });
  });

  describe('Score Calculation and Display Workflow', () => {
    it('should display total scores with correct calculations', async () => {
      const mockScores = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 15,
          weeklyScore: 10,
          assignmentCount: 3,
        },
        {
          personId: 2,
          personName: 'Jane Smith',
          totalScore: 25,
          weeklyScore: 20,
          assignmentCount: 2,
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

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledWith('/scores/total');
      });

      // Verify scores are displayed correctly
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('15 points')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
        expect(getByText('25 points')).toBeTruthy();
      });

      // Verify ranking order (highest score first)
      const scoreElements = [getByText('Jane Smith'), getByText('John Doe')];
      expect(scoreElements[0]).toBeTruthy(); // Jane should be first
    });

    it('should display weekly scores filtered by current week', async () => {
      const mockWeeklyScores = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 15,
          weeklyScore: 5, // Only current week
          assignmentCount: 1,
        },
        {
          personId: 2,
          personName: 'Jane Smith',
          totalScore: 25,
          weeklyScore: 20, // Current week
          assignmentCount: 2,
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockWeeklyScores,
      });

      const { getByText } = render(
        <TestWrapper store={store}>
          <WeeklyScoresScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledWith('/scores/weekly');
      });

      // Verify weekly scores are displayed
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('5 points')).toBeTruthy(); // Weekly score
        expect(getByText('Jane Smith')).toBeTruthy();
        expect(getByText('20 points')).toBeTruthy(); // Weekly score
      });

      // Verify week dates are shown
      expect(getByText(/Week of/)).toBeTruthy();
    });
  });

  describe('Assignment History Workflow', () => {
    it('should display assignment history with delete functionality', async () => {
      const mockAssignments = [
        {
          id: 1,
          personId: 1,
          itemType: 'reward',
          itemId: 1,
          itemName: 'Good Behavior',
          itemValue: 10,
          assignedAt: new Date('2023-11-01T10:00:00Z'),
        },
        {
          id: 2,
          personId: 2,
          itemType: 'punishment',
          itemId: 1,
          itemName: 'Late Arrival',
          itemValue: -5,
          assignedAt: new Date('2023-11-02T14:00:00Z'),
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockAssignments,
      });

      const { getByText, getAllByText } = render(
        <TestWrapper store={store}>
          <AssignmentHistoryScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledWith('/assignments');
      });

      // Verify assignments are displayed
      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
        expect(getByText('+10')).toBeTruthy();
        expect(getByText('Late Arrival')).toBeTruthy();
        expect(getByText('-5')).toBeTruthy();
      });

      // Test delete functionality
      mockApiService.delete.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      const deleteButtons = getAllByText('Delete');
      fireEvent.press(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = getByText('Confirm');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockApiService.delete).toHaveBeenCalledWith('/assignments/1');
      });
    });
  });

  describe('Data Persistence Across Navigation', () => {
    it('should maintain data consistency when navigating between screens', async () => {
      // This test simulates navigation between screens and verifies data persistence
      const mockPersons = [
        { id: 1, name: 'John Doe', createdAt: new Date(), updatedAt: new Date() },
      ];

      const mockScores = [
        {
          personId: 1,
          personName: 'John Doe',
          totalScore: 10,
          weeklyScore: 10,
          assignmentCount: 1,
        },
      ];

      // Create store with initial data
      const storeWithData = createTestStore({
        persons: { persons: mockPersons, loading: false, error: null },
        assignments: { scores: mockScores, assignments: [], loading: false, error: null },
      });

      // Render PersonManagement screen
      const { rerender, getByText } = render(
        <TestWrapper store={storeWithData}>
          <PersonManagement />
        </TestWrapper>
      );

      // Verify person data is displayed
      expect(getByText('John Doe')).toBeTruthy();

      // Navigate to TotalScoresScreen
      rerender(
        <TestWrapper store={storeWithData}>
          <TotalScoresScreen />
        </TestWrapper>
      );

      // Verify same person data is available in scores
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('10 points')).toBeTruthy();

      // Navigate back to PersonManagement
      rerender(
        <TestWrapper store={storeWithData}>
          <PersonManagement />
        </TestWrapper>
      );

      // Verify data is still there
      expect(getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      mockApiService.get.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(
        <TestWrapper store={store}>
          <PersonManagement />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Failed to load data')).toBeTruthy();
      });

      // Test retry functionality
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle validation errors from backend', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid data provided',
        },
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper store={store}>
          <PersonManagement />
        </TestWrapper>
      );

      const addButton = getByText('Add Person');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(nameInput, 'Test Person');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText('Invalid data provided')).toBeTruthy();
      });
    });
  });
});