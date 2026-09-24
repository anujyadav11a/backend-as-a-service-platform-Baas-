import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectApi from '../api/projectApi';

const ERROR_MESSAGES = {
  PROJECT_EXISTS: 'A project with this name already exists',
  PROJECT_LIMIT: 'Project limit reached. Maximum 5 projects allowed.',
  PROJECT_NOT_FOUND: 'Project not found',
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

export const createProject = createAsyncThunk(
  'project/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await projectApi.createProject(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'project/list',
  async (fields, { rejectWithValue }) => {
    try {
      const response = await projectApi.listProjects(fields);
      return response.data.data.projects;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const searchProjects = createAsyncThunk(
  'project/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await projectApi.searchProjects(query);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProject = createAsyncThunk(
  'project/get',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApi.getProject(projectId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/update',
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await projectApi.updateProject(projectId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeProject = createAsyncThunk(
  'project/delete',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApi.deleteProject(projectId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSDKConfig = createAsyncThunk(
  'project/sdkConfig',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApi.getSDKConfig(projectId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProjectConfig = createAsyncThunk(
  'project/config',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApi.getProjectConfig(projectId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProjectConfig = createAsyncThunk(
  'project/updateConfig',
  async ({ projectId, configData }, { rejectWithValue }) => {
    try {
      const response = await projectApi.updateProjectConfig(projectId, configData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const generateProjectApiKey = createAsyncThunk(
  'project/generateApiKey',
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await projectApi.generateApiKey(projectId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchApiKeys = createAsyncThunk(
  'project/listApiKeys',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectApi.listApiKeys(projectId);
      return response.data.data.keys;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const revokeProjectApiKey = createAsyncThunk(
  'project/revokeApiKey',
  async ({ projectId, keyId }, { rejectWithValue }) => {
    try {
      await projectApi.revokeApiKey(projectId, keyId);
      return { keyId };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    currentProject: null,
    sdkConfig: null,
    projectConfig: null,
    apiKeys: [],
    loading: false,
    error: null,
    searchResults: null,
    searchLoading: false,
    configLoading: false,
    apiKeysLoading: false,
    sdkConfigLoading: false,
  },
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.sdkConfig = null;
      state.projectConfig = null;
      state.apiKeys = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
    clearSDKConfig: (state) => {
      state.sdkConfig = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.projects.unshift(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchProjects.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProjects.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.error = null;
        state.searchResults = action.payload;
      })
      .addCase(searchProjects.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProject = action.payload;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...action.payload };
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.projects = state.projects.filter(p => p.id !== action.payload.id);
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = null;
          state.sdkConfig = null;
          state.projectConfig = null;
          state.apiKeys = [];
        }
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSDKConfig.pending, (state) => {
        state.sdkConfigLoading = true;
        state.error = null;
      })
      .addCase(fetchSDKConfig.fulfilled, (state, action) => {
        state.sdkConfigLoading = false;
        state.error = null;
        state.sdkConfig = action.payload;
      })
      .addCase(fetchSDKConfig.rejected, (state, action) => {
        state.sdkConfigLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectConfig.pending, (state) => {
        state.configLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.error = null;
        state.projectConfig = action.payload;
      })
      .addCase(fetchProjectConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProjectConfig.pending, (state) => {
        state.configLoading = true;
        state.error = null;
      })
      .addCase(updateProjectConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.error = null;
        state.projectConfig = action.payload;
        if (state.currentProject) {
          state.currentProject.config = action.payload;
        }
      })
      .addCase(updateProjectConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.error = action.payload;
      })
      .addCase(generateProjectApiKey.pending, (state) => {
        state.apiKeysLoading = true;
        state.error = null;
      })
      .addCase(generateProjectApiKey.fulfilled, (state, action) => {
        state.apiKeysLoading = false;
        state.error = null;
        state.apiKeys.unshift(action.payload);
      })
      .addCase(generateProjectApiKey.rejected, (state, action) => {
        state.apiKeysLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchApiKeys.pending, (state) => {
        state.apiKeysLoading = true;
        state.error = null;
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.apiKeysLoading = false;
        state.error = null;
        state.apiKeys = action.payload;
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.apiKeysLoading = false;
        state.error = action.payload;
      })
      .addCase(revokeProjectApiKey.pending, (state) => {
        state.apiKeysLoading = true;
        state.error = null;
      })
      .addCase(revokeProjectApiKey.fulfilled, (state, action) => {
        state.apiKeysLoading = false;
        state.error = null;
        const key = state.apiKeys.find(k => k.key_id === action.payload.keyId);
        if (key) {
          key.revoked = true;
          key.revoked_at = new Date().toISOString();
        }
      })
      .addCase(revokeProjectApiKey.rejected, (state, action) => {
        state.apiKeysLoading = false;
        state.error = action.payload;
      });
  },
});

export const selectProjects = (state) => state.project.projects;
export const selectCurrentProject = (state) => state.project.currentProject;
export const selectSDKConfig = (state) => state.project.sdkConfig;
export const selectProjectConfig = (state) => state.project.projectConfig;
export const selectApiKeys = (state) => state.project.apiKeys;
export const selectProjectLoading = (state) => state.project.loading;
export const selectProjectError = (state) => state.project.error;
export const selectSearchResults = (state) => state.project.searchResults;
export const selectSearchLoading = (state) => state.project.searchLoading;
export const selectConfigLoading = (state) => state.project.configLoading;
export const selectApiKeysLoading = (state) => state.project.apiKeysLoading;
export const selectSDKConfigLoading = (state) => state.project.sdkConfigLoading;

export const { clearProjectError, clearCurrentProject, clearSearchResults, clearSDKConfig } = projectSlice.actions;
export default projectSlice.reducer;