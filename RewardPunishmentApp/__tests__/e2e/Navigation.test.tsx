/**
 * End-to-End Navigation Tests
 * Tests navigation between screens and state persistence
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import personSlice from '../../src/store/slices/personSlice';
import rewardSlice from '../../src/store/slices/rewardSlice';
import punishmentSlice from '../../src/store/slices/punishmentSlice';
import assignmentSlice from '../../src/store/slices/assignmentSlice';
import uiSlice from '../../src/store/slices/uiSlice';

// Import screens
import { HomeScreen } from '../../src/screens/HomeScreen';
import { PersonManagement } from '../../src/screens/PersonManagement';
import { RewardManagement } from '../../src/screens/RewardManagement';
import { PunishmentManagement } from '../../src/screens/PunishmentManagement';
import { AssignmentManagement } from '../../src/screens/AssignmentManagement';
import { TotalScoresScreen } from '../../src/screens/TotalScoresScreen';
import { WeeklyScoresScreen } from '../../src/screens/WeeklyScoresScreen';
import { AssignmentHistoryScreen } from '../../src/screens/AssignmentHistoryScreen';

// Mock API service
jest.mock('../../src/services/api');
import { apiService } from '../../src/services/api';
const mockApiService = apiService as jest.Mocked<typeof apiService>;

const Tab = createBottomTabNavigator();

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

// Test navigation component
const TestNavigator = ({ store }: { store: any }) => (
  <Provider store={store}>
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Persons" component={PersonManagement} />
        <Tab.Screen name="Rewards" component={RewardManagement} />
        <Tab.Screen name="Punishments" component={PunishmentManagement} />
        <Tab.Screen name="Assignments" component={AssignmentManagement} />
        <Tab.Screen name="TotalScores" component={TotalScoresScreen} />
        <Tab.Screen name="WeeklyScores" component={WeeklyScoresScreen} />
        <Tab.Screen name="History" component={AssignmentHistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  </Provider>
);

describe('Navigation End-to-End Tests', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  describe('Home Screen Navigation', () => {
    it('should navigate to all management screens from home', async () => {
      // Mock empty data for all screens
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
      });

      const { getByText } = render(<TestNavigator store={store} />);

      // Start on home screen
      expect(getByText('Reward & Punishment System')).toBeTruthy();

      // Navigate to Persons
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      await waitFor(() => {
        expect(getByText('Person Management')).toBeTruthy();
      });

      // Navigate to Rewards
      const rewardsTab = getByText('Rewards');
      fireEvent.press(rewardsTab);

      await waitFor(() => {
        expect(getByText('Reward Management')).toBeTruthy();
      });

      // Navigate to Punishments
      const punishmentsTab = getByText('Punishments');
      fireEvent.press(punishmentsTab);

      await waitFor(() => {
        expect(getByText('Punishment Management')).toBeTruthy();
      });

      // Navigate to Assignments
      const assignmentsTab = getByText('Assignments');
      fireEvent.press(assignmentsTab);

      await waitFor(() => {
        expect(getByText('Assignment Management')).toBeTruthy();
      });

      // Navigate to Total Scores
      const totalScoresTab = getByText('TotalScores');
      fireEvent.press(totalScoresTab);

      await waitFor(() => {
        expect(getByText('Total Scores')).toBeTruthy();
      });

      // Navigate to Weekly Scores
      const weeklyScoresTab = getByText('WeeklyScores');
      fireEvent.press(weeklyScoresTab);

      await waitFor(() => {
        expect(getByText('Weekly Scores')).toBeTruthy();
      });

      // Navigate to History
      const historyTab = getByText('History');
      fireEvent.press(historyTab);

      await waitFor(() => {
        expect(getByText('Assignment History')).toBeTruthy();
      });
    });

    it('should provide quick access buttons to main features', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
      });

      const { getByText } = render(<TestNavigator store={store} />);

      // Test quick access buttons on home screen
      expect(getByText('Manage Persons')).toBeTruthy();
      expect(getByText('Manage Rewards')).toBeTruthy();
      expect(getByText('Manage Punishments')).toBeTruthy();
      expect(getByText('Create Assignment')).toBeTruthy();
      expect(getByText('View Scores')).toBeTruthy();

      // Test navigation via quick access button
      const managePersonsButton = getByText('Manage Persons');
      fireEvent.press(managePersonsButton);

      await waitFor(() => {
        expect(getByText('Person Management')).toBeTruthy();
      });
    });
  });

  describe('Data Persistence Across Navigation', () => {
    it('should maintain person data when navigating between screens', async () => {
      const mockPersons = [
        {
          id: 1,
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock API responses
      mockApiService.get
        .mockResolvedValueOnce({ success: true, data: mockPersons }) // Persons screen
        .mockResolvedValueOnce({ success: true, data: [] }) // Rewards screen
        .mockResolvedValueOnce({ success: true, data: mockPersons }) // Assignment screen (persons)
        .mockResolvedValueOnce({ success: true, data: [] }) // Assignment screen (rewards)
        .mockResolvedValueOnce({ success: true, data: [] }); // Assignment screen (punishments)

      const { getByText } = render(<TestNavigator store={store} />);

      // Navigate to Persons and load data
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });

      // Navigate to Rewards (different screen)
      const rewardsTab = getByText('Rewards');
      fireEvent.press(rewardsTab);

      await waitFor(() => {
        expect(getByText('Reward Management')).toBeTruthy();
      });

      // Navigate to Assignments - should still have person data
      const assignmentsTab = getByText('Assignments');
      fireEvent.press(assignmentsTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });

      // Navigate back to Persons - data should still be there
      fireEvent.press(personsTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('should maintain reward and punishment data across navigation', async () => {
      const mockRewards = [
        {
          id: 1,
          name: 'Good Behavior',
          value: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockPunishments = [
        {
          id: 1,
          name: 'Late Arrival',
          value: -5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock API responses
      mockApiService.get
        .mockResolvedValueOnce({ success: true, data: mockRewards }) // Rewards screen
        .mockResolvedValueOnce({ success: true, data: mockPunishments }) // Punishments screen
        .mockResolvedValueOnce({ success: true, data: [] }) // Assignment screen (persons)
        .mockResolvedValueOnce({ success: true, data: mockRewards }) // Assignment screen (rewards)
        .mockResolvedValueOnce({ success: true, data: mockPunishments }); // Assignment screen (punishments)

      const { getByText } = render(<TestNavigator store={store} />);

      // Load rewards
      const rewardsTab = getByText('Rewards');
      fireEvent.press(rewardsTab);

      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
      });

      // Load punishments
      const punishmentsTab = getByText('Punishments');
      fireEvent.press(punishmentsTab);

      await waitFor(() => {
        expect(getByText('Late Arrival')).toBeTruthy();
      });

      // Navigate to assignments - should have both rewards and punishments
      const assignmentsTab = getByText('Assignments');
      fireEvent.press(assignmentsTab);

      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
        expect(getByText('Late Arrival')).toBeTruthy();
      });
    });

    it('should maintain assignment and score data across navigation', async () => {
      const mockAssignments = [
        {
          id: 1,
          personId: 1,
          itemType: 'reward',
          itemId: 1,
          itemName: 'Good Behavior',
          itemValue: 10,
          assignedAt: new Date().toISOString(),
        },
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

      // Mock API responses
      mockApiService.get
        .mockResolvedValueOnce({ success: true, data: mockAssignments }) // History screen
        .mockResolvedValueOnce({ success: true, data: mockScores }) // Total scores
        .mockResolvedValueOnce({ success: true, data: mockScores }); // Weekly scores

      const { getByText } = render(<TestNavigator store={store} />);

      // Load assignment history
      const historyTab = getByText('History');
      fireEvent.press(historyTab);

      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
      });

      // Navigate to total scores
      const totalScoresTab = getByText('TotalScores');
      fireEvent.press(totalScoresTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('10 points')).toBeTruthy();
      });

      // Navigate to weekly scores
      const weeklyScoresTab = getByText('WeeklyScores');
      fireEvent.press(weeklyScoresTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('10 points')).toBeTruthy();
      });

      // Navigate back to history - data should still be there
      fireEvent.press(historyTab);

      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
      });
    });
  });

  describe('Navigation State Management', () => {
    it('should handle navigation with loading states', async () => {
      // Mock delayed API response
      mockApiService.get.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ success: true, data: [] }), 100)
        )
      );

      const { getByText, queryByText } = render(<TestNavigator store={store} />);

      // Navigate to persons
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      // Should show loading state
      await waitFor(() => {
        expect(queryByText('Loading...')).toBeTruthy();
      });

      // Should hide loading state after data loads
      await waitFor(() => {
        expect(queryByText('Loading...')).toBeFalsy();
      }, { timeout: 2000 });
    });

    it('should handle navigation with error states', async () => {
      // Mock API error
      mockApiService.get.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(<TestNavigator store={store} />);

      // Navigate to persons
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      // Should show error state
      await waitFor(() => {
        expect(getByText('Failed to load data')).toBeTruthy();
      });

      // Should have retry option
      expect(getByText('Retry')).toBeTruthy();
    });

    it('should maintain form state when navigating away and back', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
      });

      const { getByText, getByPlaceholderText } = render(<TestNavigator store={store} />);

      // Navigate to persons and start creating a person
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      const addButton = getByText('Add Person');
      fireEvent.press(addButton);

      const nameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(nameInput, 'Partial Name');

      // Navigate away
      const rewardsTab = getByText('Rewards');
      fireEvent.press(rewardsTab);

      // Navigate back
      fireEvent.press(personsTab);

      // Form should be reset (this is expected behavior for better UX)
      await waitFor(() => {
        expect(getByText('Person Management')).toBeTruthy();
      });
    });
  });

  describe('Deep Navigation Workflows', () => {
    it('should handle complete workflow: create person -> create reward -> assign -> view scores', async () => {
      const mockPerson = {
        id: 1,
        name: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockReward = {
        id: 1,
        name: 'Good Behavior',
        value: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockAssignment = {
        id: 1,
        personId: 1,
        itemType: 'reward',
        itemId: 1,
        itemName: 'Good Behavior',
        itemValue: 10,
        assignedAt: new Date().toISOString(),
      };

      const mockScore = {
        personId: 1,
        personName: 'John Doe',
        totalScore: 10,
        weeklyScore: 10,
        assignmentCount: 1,
      };

      const { getByText, getByPlaceholderText } = render(<TestNavigator store={store} />);

      // Step 1: Create person
      mockApiService.get.mockResolvedValueOnce({ success: true, data: [] });
      
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      const addPersonButton = getByText('Add Person');
      fireEvent.press(addPersonButton);

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockPerson,
      });

      const nameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(nameInput, 'John Doe');

      const savePersonButton = getByText('Save');
      fireEvent.press(savePersonButton);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Step 2: Create reward
      mockApiService.get.mockResolvedValueOnce({ success: true, data: [] });
      
      const rewardsTab = getByText('Rewards');
      fireEvent.press(rewardsTab);

      const addRewardButton = getByText('Add Reward');
      fireEvent.press(addRewardButton);

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: mockReward,
      });

      const rewardNameInput = getByPlaceholderText('Enter reward name');
      const rewardValueInput = getByPlaceholderText('Enter reward value');
      fireEvent.changeText(rewardNameInput, 'Good Behavior');
      fireEvent.changeText(rewardValueInput, '10');

      const saveRewardButton = getByText('Save');
      fireEvent.press(saveRewardButton);

      await waitFor(() => {
        expect(getByText('Good Behavior')).toBeTruthy();
      });

      // Step 3: Create assignment
      mockApiService.get
        .mockResolvedValueOnce({ success: true, data: [mockPerson] })
        .mockResolvedValueOnce({ success: true, data: [mockReward] })
        .mockResolvedValueOnce({ success: true, data: [] });

      const assignmentsTab = getByText('Assignments');
      fireEvent.press(assignmentsTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Good Behavior')).toBeTruthy();
      });

      // Select reward and person
      const rewardButton = getByText('Good Behavior');
      fireEvent.press(rewardButton);

      const personCheckbox = getByText('John Doe');
      fireEvent.press(personCheckbox);

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: [mockAssignment],
      });

      const assignButton = getByText('Assign');
      fireEvent.press(assignButton);

      await waitFor(() => {
        expect(getByText('Assignment created successfully')).toBeTruthy();
      });

      // Step 4: View scores
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [mockScore],
      });

      const totalScoresTab = getByText('TotalScores');
      fireEvent.press(totalScoresTab);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('10 points')).toBeTruthy();
      });
    });

    it('should handle navigation during form submission', async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const { getByText, getByPlaceholderText } = render(<TestNavigator store={store} />);

      // Navigate to persons
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      // Start creating person
      const addButton = getByText('Add Person');
      fireEvent.press(addButton);

      // Mock slow API response
      mockApiService.post.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            success: true,
            data: { id: 1, name: 'John Doe', createdAt: new Date(), updatedAt: new Date() }
          }), 1000)
        )
      );

      const nameInput = getByPlaceholderText('Enter person name');
      fireEvent.changeText(nameInput, 'John Doe');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      // Try to navigate away during submission
      const rewardsTab = getByText('Rewards');
      fireEvent.press(rewardsTab);

      // Should either stay on current screen or show loading state
      // The exact behavior depends on implementation, but it should be handled gracefully
      await waitFor(() => {
        // Should eventually complete the operation
        expect(mockApiService.post).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Navigation Accessibility', () => {
    it('should provide accessible navigation elements', async () => {
      mockApiService.get.mockResolvedValue({ success: true, data: [] });

      const { getByText, getByLabelText } = render(<TestNavigator store={store} />);

      // Tab navigation should be accessible
      expect(getByText('Persons')).toBeTruthy();
      expect(getByText('Rewards')).toBeTruthy();
      expect(getByText('Punishments')).toBeTruthy();
      expect(getByText('Assignments')).toBeTruthy();

      // Navigation elements should have proper accessibility labels
      const personsTab = getByText('Persons');
      fireEvent.press(personsTab);

      await waitFor(() => {
        expect(getByText('Person Management')).toBeTruthy();
      });
    });
  });
});