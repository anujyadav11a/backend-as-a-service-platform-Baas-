import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attributeApi from '../api/attributeApi';

const ERROR_MESSAGES = {
  ATTRIBUTE_EXISTS: 'An attribute with this name already exists in the collection',
  ATTRIBUTE_NOT_FOUND: 'Attribute not found',
  COLLECTION_NOT_FOUND: 'Collection not found',
  PROJECT_NOT_FOUND: 'Project not found or access denied',
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  VALIDATION_ERROR: 'Please check your input and try again',
  LAST_ATTRIBUTE: 'Cannot delete the last attribute in a collection',
};

const getErrorMessage = (error) => {
  const code = error.response?.data?.error?.code;
  const backendMessage = error.response?.data?.error?.message;
  const msg = code && ERROR_MESSAGES[code]
    ? ERROR_MESSAGES[code]
    : backendMessage || 'An unexpected error occurred';
  return typeof msg === 'string' ? msg : JSON.stringify(msg);
};

export const createAttribute = createAsyncThunk(
  'attribute/create',
  async ({ projectId, collectionId, data }, { rejectWithValue }) => {
    try {
      const response = await attributeApi.createAttribute(projectId, collectionId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAttributes = createAsyncThunk(
  'attribute/list',
  async ({ projectId, collectionId }, { rejectWithValue }) => {
    try {
      const response = await attributeApi.listAttributes(projectId, collectionId);
      return response.data.data.attributes || response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAttribute = createAsyncThunk(
  'attribute/update',
  async ({ projectId, collectionId, attributeId, data }, { rejectWithValue }) => {
    try {
      const response = await attributeApi.updateAttribute(projectId, collectionId, attributeId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeAttribute = createAsyncThunk(
  'attribute/delete',
  async ({ projectId, collectionId, attributeId }, { rejectWithValue }) => {
    try {
      const response = await attributeApi.deleteAttribute(projectId, collectionId, attributeId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const attributeSlice = createSlice({
  name: 'attribute',
  initialState: {
    attributes: [],
    currentAttribute: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAttributeError: (state) => {
      state.error = null;
    },
    clearCurrentAttribute: (state) => {
      state.currentAttribute = null;
    },
    clearAttributes: (state) => {
      state.attributes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.attributes.unshift(action.payload);
        state.currentAttribute = action.payload;
      })
      .addCase(createAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.attributes = action.payload;
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const index = state.attributes.findIndex(attr => attr.id === action.payload.id);
        if (index !== -1) {
          state.attributes[index] = action.payload;
        }
        state.currentAttribute = action.payload;
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeAttribute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAttribute.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.attributes = state.attributes.filter(attr => attr.id !== action.payload.id);
        if (state.currentAttribute?.id === action.payload.id) {
          state.currentAttribute = null;
        }
      })
      .addCase(removeAttribute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectAttributes = (state) => state.attribute.attributes;
export const selectCurrentAttribute = (state) => state.attribute.currentAttribute;
export const selectAttributeLoading = (state) => state.attribute.loading;
export const selectAttributeError = (state) => state.attribute.error;

export const { clearAttributeError, clearCurrentAttribute, clearAttributes } = attributeSlice.actions;
export default attributeSlice.reducer;