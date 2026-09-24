import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import collectionApi from '../api/collectionApi';

const ERROR_MESSAGES = {
  COLLECTION_EXISTS: 'A collection with this name already exists in the database',
  COLLECTION_NOT_FOUND: 'Collection not found',
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

export const createCollection = createAsyncThunk(
  'collection/create',
  async ({ projectId, databaseId, data }, { rejectWithValue }) => {
    try {
      const response = await collectionApi.createCollection(projectId, databaseId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCollections = createAsyncThunk(
  'collection/list',
  async ({ projectId, databaseId }, { rejectWithValue }) => {
    try {
      const response = await collectionApi.listCollections(projectId, databaseId);
      return response.data.data.collections || response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeCollection = createAsyncThunk(
  'collection/delete',
  async ({ projectId, collectionId }, { rejectWithValue }) => {
    try {
      const response = await collectionApi.deleteCollection(projectId, collectionId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    collections: [],
    currentCollection: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCollectionError: (state) => {
      state.error = null;
    },
    clearCurrentCollection: (state) => {
      state.currentCollection = null;
    },
    clearCollections: (state) => {
      state.collections = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.collections.unshift(action.payload);
        state.currentCollection = action.payload;
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.collections = state.collections.filter(col => col.id !== action.payload.id);
        if (state.currentCollection?.id === action.payload.id) {
          state.currentCollection = null;
        }
      })
      .addCase(removeCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectCollections = (state) => state.collection.collections;
export const selectCurrentCollection = (state) => state.collection.currentCollection;
export const selectCollectionLoading = (state) => state.collection.loading;
export const selectCollectionError = (state) => state.collection.error;

export const { clearCollectionError, clearCurrentCollection, clearCollections } = collectionSlice.actions;
export default collectionSlice.reducer;