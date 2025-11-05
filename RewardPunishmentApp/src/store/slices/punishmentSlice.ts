import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Punishment } from '../../types';
import { apiService } from '../../services/api';

interface PunishmentState {
  punishments: Punishment[];
  loading: boolean;
  error: string | null;
}

const initialState: PunishmentState = {
  punishments: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchPunishments = createAsyncThunk(
  'punishments/fetchPunishments',
  async (_, { rejectWithValue }) => {
    const response = await apiService.get<Punishment[]>('/punishments');
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to fetch punishments');
    }
    return response.data!;
  }
);

export const createPunishment = createAsyncThunk(
  'punishments/createPunishment',
  async (punishmentData: { name: string; value: number }, { rejectWithValue }) => {
    const response = await apiService.post<Punishment>('/punishments', punishmentData);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to create punishment');
    }
    return response.data!;
  }
);

export const updatePunishmentAsync = createAsyncThunk(
  'punishments/updatePunishment',
  async (punishment: Punishment, { rejectWithValue }) => {
    const response = await apiService.put<Punishment>(`/punishments/${punishment.id}`, punishment);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to update punishment');
    }
    return response.data!;
  }
);

export const deletePunishment = createAsyncThunk(
  'punishments/deletePunishment',
  async (punishmentId: number, { rejectWithValue }) => {
    const response = await apiService.delete(`/punishments/${punishmentId}`);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to delete punishment');
    }
    return punishmentId;
  }
);

const punishmentSlice = createSlice({
  name: 'punishments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPunishments: (state, action: PayloadAction<Punishment[]>) => {
      state.punishments = action.payload;
    },
    addPunishment: (state, action: PayloadAction<Punishment>) => {
      state.punishments.push(action.payload);
    },
    updatePunishment: (state, action: PayloadAction<Punishment>) => {
      const index = state.punishments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.punishments[index] = action.payload;
      }
    },
    removePunishment: (state, action: PayloadAction<number>) => {
      state.punishments = state.punishments.filter(p => p.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch punishments
      .addCase(fetchPunishments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPunishments.fulfilled, (state, action) => {
        state.loading = false;
        state.punishments = action.payload;
      })
      .addCase(fetchPunishments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create punishment
      .addCase(createPunishment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPunishment.fulfilled, (state, action) => {
        state.loading = false;
        state.punishments.push(action.payload);
      })
      .addCase(createPunishment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update punishment
      .addCase(updatePunishmentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePunishmentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.punishments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.punishments[index] = action.payload;
        }
      })
      .addCase(updatePunishmentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete punishment
      .addCase(deletePunishment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePunishment.fulfilled, (state, action) => {
        state.loading = false;
        state.punishments = state.punishments.filter(p => p.id !== action.payload);
      })
      .addCase(deletePunishment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setPunishments,
  addPunishment,
  updatePunishment,
  removePunishment,
  clearError,
} = punishmentSlice.actions;

export default punishmentSlice.reducer;