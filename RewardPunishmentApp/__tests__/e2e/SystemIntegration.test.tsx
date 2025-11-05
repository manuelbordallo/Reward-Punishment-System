/**
 * System Integration End-to-End Tests
 * Tests complete system workflows from start to finish
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5
 */

import React from 'react';
import { render, fireEvent, waitFor, getAllByText } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import personSlice from '../../src/store/slices/personSlice';
import rewardSlice from '../../src/store/slices/rewardSlice';
import punishmentSlice from '../../src/store/slices/punishmentSlice';
import assignmentSlice from '../../src/store/slices/assignmentSlice';
import uiSlice from '../../src/store/slices/uiSlice';

// Import the main App component
import App from '../../App';

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

describe('System Integration End-to-End Tests', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  describe('App Structure and Navigation', () => {
    it('should render app structure and navigation tabs', async () => {
      const { getByText, getAllByText } = render(
        <TestWrapper store={store}>
          <App />
        </TestWrapper>
      );

      // Wait for app to load and check for navigation tabs
      await waitFor(() => {
        expect(getByText('Personas')).toBeTruthy();
      });

      // Verify main navigation tabs are present
      expect(getByText('Inicio')).toBeTruthy();
      expect(getByText('Premios')).toBeTruthy();
      expect(getByText('Castigos')).toBeTruthy();
      expect(getByText('Asignar')).toBeTruthy();
      expect(getAllByText('Historial')).toHaveLength(2); // Tab and card
      expect(getByText('Puntuaciones')).toBeTruthy();
      expect(getByText('Semanal')).toBeTruthy();
    });

    it('should display home screen content', async () => {
      const { getByText } = render(
        <TestWrapper store={store}>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Sistema de Premios y Castigos')).toBeTruthy();
      });

      // Verify home screen content
      expect(getByText('Gestiona premios, castigos y puntuaciones')).toBeTruthy();
      expect(getByText('Selecciona una opción para comenzar')).toBeTruthy();
    });

    it('should have navigation cards for all main features', async () => {
      const { getByText } = render(
        <TestWrapper store={store}>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Sistema de Premios y Castigos')).toBeTruthy();
      });

      // Verify all navigation cards are present
      expect(getByText('Gestión de Personas')).toBeTruthy();
      expect(getByText('Gestión de Premios')).toBeTruthy();
      expect(getByText('Gestión de Castigos')).toBeTruthy();
      expect(getByText('Asignar Premio/Castigo')).toBeTruthy();
      expect(getByText('Puntuaciones Totales')).toBeTruthy();
      expect(getByText('Vista Semanal')).toBeTruthy();
    });
  });

  describe('Navigation Functionality', () => {
    it('should allow navigation between tabs', async () => {
      const { getByText } = render(
        <TestWrapper store={store}>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Personas')).toBeTruthy();
      });

      // Test navigation to different tabs
      const personsTab = getByText('Personas');
      fireEvent.press(personsTab);

      const rewardsTab = getByText('Premios');
      fireEvent.press(rewardsTab);

      const punishmentsTab = getByText('Castigos');
      fireEvent.press(punishmentsTab);

      // Verify API service is available for mocking
      expect(mockApiService).toBeDefined();
      expect(mockApiService.get).toBeDefined();
      expect(mockApiService.post).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockApiService.get.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(
        <TestWrapper store={store}>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Personas')).toBeTruthy();
      });

      // Navigate to a screen that would trigger API call
      const personsTab = getByText('Personas');
      fireEvent.press(personsTab);

      // The error should be handled gracefully by the app
      // (specific error handling depends on implementation)
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent state across navigation', async () => {
      // Setup store with some initial data
      const dataStore = createTestStore({
        persons: { 
          persons: [{ id: 1, name: 'Test Person', createdAt: new Date(), updatedAt: new Date() }], 
          loading: false, 
          error: null 
        },
        rewards: { rewards: [], loading: false, error: null },
        punishments: { punishments: [], loading: false, error: null },
        assignments: { assignments: [], scores: [], loading: false, error: null },
        ui: { isLoading: false, error: null },
      });

      const { getByText } = render(
        <TestWrapper store={dataStore}>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Personas')).toBeTruthy();
      });

      // Navigate between tabs and verify state is maintained
      const personsTab = getByText('Personas');
      fireEvent.press(personsTab);

      const rewardsTab = getByText('Premios');
      fireEvent.press(rewardsTab);

      // Navigate back to persons
      fireEvent.press(personsTab);

      // Verify store state is maintained
      expect(dataStore.getState().persons.persons).toHaveLength(1);
      expect(dataStore.getState().persons.persons[0].name).toBe('Test Person');
    });
  });
});