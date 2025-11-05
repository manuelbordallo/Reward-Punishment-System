import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Assignment, PersonScore } from '../../types';
import { apiService } from '../../services/api';

interface AssignmentState {
  assignments: Assignment[];
  scores: PersonScore[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  scores: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (_, { rejectWithValue }) => {
    const response = await apiService.get<Assignment[]>('/assignments');
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to fetch assignments');
    }
    return response.data!;
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData: {
    personIds: number[];
    itemType: 'reward' | 'punishment';
    itemId: number;
    itemName: string;
    itemValue: number;
  }, { rejectWithValue }) => {
    const response = await apiService.post<Assignment[]>('/assignments', assignmentData);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to create assignment');
    }
    return response.data!;
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/deleteAssignment',
  async (assignmentId: number, { rejectWithValue }) => {
    const response = await apiService.delete(`/assignments/${assignmentId}`);
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to delete assignment');
    }
    return assignmentId;
  }
);

export const fetchTotalScores = createAsyncThunk(
  'assignments/fetchTotalScores',
  async (_, { rejectWithValue }) => {
    const response = await apiService.get<PersonScore[]>('/scores/total');
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to fetch total scores');
    }
    return response.data!;
  }
);

export const fetchWeeklyScores = createAsyncThunk(
  'assignments/fetchWeeklyScores',
  async (_, { rejectWithValue }) => {
    const response = await apiService.get<PersonScore[]>('/scores/weekly');
    if (!response.success) {
      return rejectWithValue(response.error?.message || 'Failed to fetch weekly scores');
    }
    return response.data!;
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload;
    },
    addAssignment: (state, action: PayloadAction<Assignment>) => {
      state.assignments.push(action.payload);
    },
    addAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments.push(...action.payload);
    },
    removeAssignment: (state, action: PayloadAction<number>) => {
      state.assignments = state.assignments.filter(a => a.id !== action.payload);
    },
    setScores: (state, action: PayloadAction<PersonScore[]>) => {
      state.scores = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(...action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch total scores
      .addCase(fetchTotalScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchTotalScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch weekly scores
      .addCase(fetchWeeklyScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchWeeklyScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setAssignments,
  addAssignment,
  addAssignments,
  removeAssignment,
  setScores,
  clearError,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;