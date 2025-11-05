import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isLoading: boolean;
  error: string | null;
  currentScreen: string;
  isOnline: boolean;
  loadingMessage: string;
}

const initialState: UiState = {
  isLoading: false,
  error: null,
  currentScreen: 'Home',
  isOnline: true,
  loadingMessage: 'Cargando...',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean | { loading: boolean; message?: string }>) => {
      if (typeof action.payload === 'boolean') {
        state.isLoading = action.payload;
        if (!action.payload) {
          state.loadingMessage = 'Cargando...';
        }
      } else {
        state.isLoading = action.payload.loading;
        if (action.payload.message) {
          state.loadingMessage = action.payload.message;
        }
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (!action.payload) {
        state.error = 'Network Error: No hay conexión a internet';
      } else if (state.error?.includes('Network Error')) {
        state.error = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    showNetworkError: (state, action: PayloadAction<string>) => {
      state.error = `Network Error: ${action.payload}`;
      state.isLoading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setCurrentScreen,
  setOnlineStatus,
  clearError,
  showNetworkError,
} = uiSlice.actions;

export default uiSlice.reducer;