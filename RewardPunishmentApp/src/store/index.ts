import { configureStore } from '@reduxjs/toolkit';
import personSlice from './slices/personSlice';
import rewardSlice from './slices/rewardSlice';
import punishmentSlice from './slices/punishmentSlice';
import assignmentSlice from './slices/assignmentSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    persons: personSlice,
    rewards: rewardSlice,
    punishments: punishmentSlice,
    assignments: assignmentSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check to allow Date objects
    }),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Re-export selectors
export * from './selectors';

// Re-export thunks
export * from './thunks';