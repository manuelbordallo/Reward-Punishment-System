import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Reward } from '../../types';
import { apiService } from '../../services/api';

interface RewardState {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
}

const initialState: RewardState = {
  rewards: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (_, { rejectWithValue }) => {
    const response = await apiService.get<Reward[]>('/rewards');
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to fetch rewards');
    }
    return response.data!;
  }
);

export const createReward = createAsyncThunk(
  'rewards/createReward',
  async (rewardData: { name: string; value: number }, { rejectWithValue }) => {
    const response = await apiService.post<Reward>('/rewards', rewardData);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to create reward');
    }
    return response.data!;
  }
);

export const updateRewardAsync = createAsyncThunk(
  'rewards/updateReward',
  async (reward: Reward, { rejectWithValue }) => {
    const response = await apiService.put<Reward>(`/rewards/${reward.id}`, reward);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to update reward');
    }
    return response.data!;
  }
);

export const deleteReward = createAsyncThunk(
  'rewards/deleteReward',
  async (rewardId: number, { rejectWithValue }) => {
    const response = await apiService.delete(`/rewards/${rewardId}`);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to delete reward');
    }
    return rewardId;
  }
);

const rewardSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRewards: (state, action: PayloadAction<Reward[]>) => {
      state.rewards = action.payload;
    },
    addReward: (state, action: PayloadAction<Reward>) => {
      state.rewards.push(action.payload);
    },
    updateReward: (state, action: PayloadAction<Reward>) => {
      const index = state.rewards.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.rewards[index] = action.payload;
      }
    },
    removeReward: (state, action: PayloadAction<number>) => {
      state.rewards = state.rewards.filter(r => r.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create reward
      .addCase(createReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReward.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards.push(action.payload);
      })
      .addCase(createReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update reward
      .addCase(updateRewardAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRewardAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rewards.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.rewards[index] = action.payload;
        }
      })
      .addCase(updateRewardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete reward
      .addCase(deleteReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReward.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = state.rewards.filter(r => r.id !== action.payload);
      })
      .addCase(deleteReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setRewards,
  addReward,
  updateReward,
  removeReward,
  clearError,
} = rewardSlice.actions;

export default rewardSlice.reducer;