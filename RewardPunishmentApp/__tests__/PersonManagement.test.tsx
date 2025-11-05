/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PersonManagement } from '../src/screens/PersonManagement';
import personSlice from '../src/store/slices/personSlice';

// Mock the API service
jest.mock('../src/services/api', () => ({
  apiService: {
    get: jest.fn().mockResolvedValue({ success: true, data: [] }),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      persons: personSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable serializable check to allow Date objects
      }),
  });
};

describe('PersonManagement', () => {
  it('renders correctly', async () => {
    const store = createTestStore();
    
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <Provider store={store}>
          <PersonManagement />
        </Provider>
      );
    });
    
    // Test passes if no errors are thrown during rendering
    expect(true).toBeTruthy();
  });
});