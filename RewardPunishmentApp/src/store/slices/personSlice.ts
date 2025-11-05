import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Person } from '../../types';
import { apiService } from '../../services/api';

interface PersonState {
  persons: Person[];
  loading: boolean;
  error: string | null;
}

const initialState: PersonState = {
  persons: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchPersons = createAsyncThunk(
  'persons/fetchPersons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Person[]>('/persons');
      if (!response.success) {
        return rejectWithValue(response.error?.message || 'Failed to fetch persons');
      }
      return response.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

export const createPerson = createAsyncThunk(
  'persons/createPerson',
  async (personData: { name: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Person>('/persons', personData);
      if (!response.success) {
        return rejectWithValue(response.error?.message || 'Failed to create person');
      }
      return response.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

export const updatePersonAsync = createAsyncThunk(
  'persons/updatePerson',
  async (person: Person, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Person>(`/persons/${person.id}`, person);
      if (!response.success) {
        return rejectWithValue(response.error?.message || 'Failed to update person');
      }
      return response.data!;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

export const deletePerson = createAsyncThunk(
  'persons/deletePerson',
  async (personId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/persons/${personId}`);
      if (!response.success) {
        return rejectWithValue(response.error?.message || 'Failed to delete person');
      }
      return personId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
);

const personSlice = createSlice({
  name: 'persons',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPersons: (state, action: PayloadAction<Person[]>) => {
      state.persons = action.payload;
    },
    addPerson: (state, action: PayloadAction<Person>) => {
      state.persons.push(action.payload);
    },
    updatePerson: (state, action: PayloadAction<Person>) => {
      const index = state.persons.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.persons[index] = action.payload;
      }
    },
    removePerson: (state, action: PayloadAction<number>) => {
      state.persons = state.persons.filter(p => p.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch persons
      .addCase(fetchPersons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = action.payload;
      })
      .addCase(fetchPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create person
      .addCase(createPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.persons.push(action.payload);
      })
      .addCase(createPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update person
      .addCase(updatePersonAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.persons.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.persons[index] = action.payload;
        }
      })
      .addCase(updatePersonAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete person
      .addCase(deletePerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = state.persons.filter(p => p.id !== action.payload);
      })
      .addCase(deletePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setPersons,
  addPerson,
  updatePerson,
  removePerson,
  clearError,
} = personSlice.actions;

export default personSlice.reducer;