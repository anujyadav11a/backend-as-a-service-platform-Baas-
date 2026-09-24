import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import databaseApi from '../api/databaseApi';

const ERROR_MESSAGES = {
  DATABASE_EXISTS: 'A database with this name already exists in the project',
  DATABASE_NOT_FOUND: 'Database not found',
  PROJECT_NOT_FOUND: 'Project not found or access denied',
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  VALIDATION_ERROR: 'Please check your input and try again',
};

const getErrorMessage = (error) => {
  const code = error.response?.data?.error?.code;
  const backendMessage = error.response?.data?.error?.message;
  const msg = code && ERROR_MESSAGES[code]
    ? ERROR_MESSAGES[code]
    : backendMessage || 'An unexpected error occurred';
  return typeof msg === 'string' ? msg : JSON.stringify(msg);
};

export const createDatabase = createAsyncThunk(
  'database/create',
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.createDatabase(projectId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchDatabases = createAsyncThunk(
  'database/list',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await databaseApi.listDatabases(projectId);
      // Backend returns: { project_id, total_databases, databases: [...] }
      return response.data.data.databases || response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchDatabase = createAsyncThunk(
  'database/get',
  async ({ projectId, databaseId }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getDatabase(projectId, databaseId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeDatabase = createAsyncThunk(
  'database/delete',
  async ({ projectId, databaseId }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.deleteDatabase(projectId, databaseId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const databaseSlice = createSlice({
  name: 'database',
  initialState: {
    databases: [],
    currentDatabase: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDatabaseError: (state) => {
      state.error = null;
    },
    clearCurrentDatabase: (state) => {
      state.currentDatabase = null;
    },
    clearDatabases: (state) => {
      state.databases = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDatabase.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.databases.unshift(action.payload);
        state.currentDatabase = action.payload;
      })
      .addCase(createDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDatabases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatabases.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.databases = action.payload;
      })
      .addCase(fetchDatabases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatabase.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentDatabase = action.payload;
      })
      .addCase(fetchDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeDatabase.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.databases = state.databases.filter(db => db.id !== action.payload.id);
        if (state.currentDatabase?.id === action.payload.id) {
          state.currentDatabase = null;
        }
      })
      .addCase(removeDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectDatabases = (state) => state.database.databases;
export const selectCurrentDatabase = (state) => state.database.currentDatabase;
export const selectDatabaseLoading = (state) => state.database.loading;
export const selectDatabaseError = (state) => state.database.error;

export const { clearDatabaseError, clearCurrentDatabase, clearDatabases } = databaseSlice.actions;
export default databaseSlice.reducer;