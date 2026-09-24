import { useDispatch, useSelector } from 'react-redux';
import {
  createProject,
  fetchProjects,
  searchProjects,
  fetchProject,
  updateProject,
  removeProject,
  fetchSDKConfig,
  fetchProjectConfig,
  updateProjectConfig,
  generateProjectApiKey,
  fetchApiKeys,
  revokeProjectApiKey,
  clearProjectError,
  clearCurrentProject,
  clearSearchResults,
  clearSDKConfig,
} from '../state/projectSlice';
import {
  selectProjects,
  selectCurrentProject,
  selectSDKConfig,
  selectProjectConfig,
  selectApiKeys,
  selectProjectLoading,
  selectProjectError,
  selectSearchResults,
  selectSearchLoading,
  selectConfigLoading,
  selectApiKeysLoading,
  selectSDKConfigLoading,
} from '../state/projectSlice';

/**
 * Hook providing project state and actions.
 * @returns {Object} Project state and methods
 * @returns {Project[]} projects - List of user's projects
 * @returns {Project|null} currentProject - Currently selected project
 * @returns {SDKConfig|null} sdkConfig - SDK configuration for current project
 * @returns {ProjectConfig|null} projectConfig - Project configuration (CORS, limits)
 * @returns {ApiKey[]} apiKeys - List of API keys for current project
 * @returns {boolean} loading - Whether a project operation is in progress
 * @returns {boolean} searchLoading - Whether search is in progress
 * @returns {boolean} configLoading - Whether config operation is in progress
 * @returns {boolean} apiKeysLoading - Whether API key operation is in progress
 * @returns {boolean} sdkConfigLoading - Whether SDK config fetch is in progress
 * @returns {string|null} error - Current error message
 * @returns {SearchProjectsResult|null} searchResults - Search results
 * @returns {Function} create - Create project function
 * @returns {Function} list - Fetch projects function
 * @returns {Function} search - Search projects function
 * @returns {Function} get - Fetch single project function
 * @returns {Function} update - Update project function
 * @returns {Function} remove - Delete project function
 * @returns {Function} getSDK - Fetch SDK config function
 * @returns {Function} getConfig - Fetch project config function
 * @returns {Function} updateConfig - Update project config function
 * @returns {Function} generateApiKey - Generate API key function
 * @returns {Function} listApiKeys - List API keys function
 * @returns {Function} revokeApiKey - Revoke API key function
 * @returns {Function} clearError - Clear error state
 * @returns {Function} clearCurrent - Clear current project state
 * @returns {Function} clearSearch - Clear search results
 * @returns {Function} clearSDK - Clear SDK config
 */
export function useProject() {
  const projects = useSelector(selectProjects);
  const currentProject = useSelector(selectCurrentProject);
  const sdkConfig = useSelector(selectSDKConfig);
  const projectConfig = useSelector(selectProjectConfig);
  const apiKeys = useSelector(selectApiKeys);
  const loading = useSelector(selectProjectLoading);
  const searchLoading = useSelector(selectSearchLoading);
  const configLoading = useSelector(selectConfigLoading);
  const apiKeysLoading = useSelector(selectApiKeysLoading);
  const sdkConfigLoading = useSelector(selectSDKConfigLoading);
  const error = useSelector(selectProjectError);
  const searchResults = useSelector(selectSearchResults);
  const dispatch = useDispatch();

  const create = (data) => dispatch(createProject(data));
  const list = (fields) => dispatch(fetchProjects(fields));
  const search = (query) => dispatch(searchProjects(query));
  const get = (projectId) => dispatch(fetchProject(projectId));
  const update = (projectId, data) => dispatch(updateProject({ projectId, data }));
  const remove = (projectId) => dispatch(removeProject(projectId));
  const getSDK = (projectId) => dispatch(fetchSDKConfig(projectId));
  const getConfig = (projectId) => dispatch(fetchProjectConfig(projectId));
  const updateConfig = (projectId, configData) => dispatch(updateProjectConfig({ projectId, configData }));
  const generateApiKey = (projectId, data) => dispatch(generateProjectApiKey({ projectId, data }));
  const listApiKeys = (projectId) => dispatch(fetchApiKeys(projectId));
  const revokeApiKey = (projectId, keyId) => dispatch(revokeProjectApiKey({ projectId, keyId }));
  const clearError = () => dispatch(clearProjectError());
  const clearCurrent = () => dispatch(clearCurrentProject());
  const clearSearch = () => dispatch(clearSearchResults());
  const clearSDK = () => dispatch(clearSDKConfig());

  return {
    projects,
    currentProject,
    sdkConfig,
    projectConfig,
    apiKeys,
    loading,
    searchLoading,
    configLoading,
    apiKeysLoading,
    sdkConfigLoading,
    error,
    searchResults,
    create,
    list,
    search,
    get,
    update,
    remove,
    getSDK,
    getConfig,
    updateConfig,
    generateApiKey,
    listApiKeys,
    revokeApiKey,
    clearError,
    clearCurrent,
    clearSearch,
    clearSDK,
  };
}

/**
 * Hook for project list handling - thin wrapper around useProject
 * @returns {Object} Project list state and actions
 */
export function useProjectList() {
  const { projects, loading, error, list, create, clearError } = useProject();

  const handleList = async (fields) => {
    clearError();
    try {
      await list(fields).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleCreate = async (data) => {
    clearError();
    try {
      await create(data).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { projects, loading, error, handleList, handleCreate, clearError };
}

/**
 * Hook for single project handling - thin wrapper around useProject
 * @param {string} projectId - Project ID
 * @returns {Object} Single project state and actions
 */
const PROJECT_ID_REQUIRED = { success: false, error: { message: 'Project ID is required' } };

// Memoized empty state objects for early returns
const EMPTY_SINGLE_PROJECT = {
  project: null,
  loading: false,
  error: 'Project ID is required',
  handleFetch: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleUpdate: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleRemove: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleGetSDK: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleGetConfig: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleUpdateConfig: () => Promise.resolve(PROJECT_ID_REQUIRED),
  clearError: () => {},
  clearCurrent: () => {},
};

const EMPTY_SDK_CONFIG = {
  sdkConfig: null,
  sdkConfigLoading: false,
  error: 'Project ID is required',
  handleFetch: () => Promise.resolve(PROJECT_ID_REQUIRED),
  clearSDK: () => {},
  clearError: () => {},
};

const EMPTY_PROJECT_CONFIG = {
  projectConfig: null,
  configLoading: false,
  error: 'Project ID is required',
  handleFetch: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleUpdate: () => Promise.resolve(PROJECT_ID_REQUIRED),
  clearError: () => {},
};

const EMPTY_API_KEYS = {
  apiKeys: [],
  apiKeysLoading: false,
  error: 'Project ID is required',
  handleFetch: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleGenerate: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleRevoke: () => Promise.resolve(PROJECT_ID_REQUIRED),
  clearError: () => {},
};

export function useSingleProject(projectId) {
  const {
    currentProject,
    loading,
    error,
    get,
    update,
    remove,
    getSDK,
    getConfig,
    updateConfig,
    clearError,
    clearCurrent,
  } = useProject();

  if (!projectId) {
    return EMPTY_SINGLE_PROJECT;
  }

  const handleFetch = async () => {
    clearError();
    try {
      await get(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleUpdate = async (data) => {
    clearError();
    try {
      await update(projectId, data).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleRemove = async () => {
    clearError();
    try {
      await remove(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleGetSDK = async () => {
    clearError();
    try {
      await getSDK(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleGetConfig = async () => {
    clearError();
    try {
      await getConfig(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleUpdateConfig = async (configData) => {
    clearError();
    try {
      await updateConfig(projectId, configData).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    project: currentProject,
    loading,
    error,
    handleFetch,
    handleUpdate,
    handleRemove,
    handleGetSDK,
    handleGetConfig,
    handleUpdateConfig,
    clearError,
    clearCurrent,
  };
}

/**
 * Hook for project search handling
 * @returns {Object} Search state and actions
 */
export function useProjectSearch() {
  const { searchResults, searchLoading, error, search, clearSearch, clearError } = useProject();

  const handleSearch = async (query) => {
    clearError();
    try {
      await search(query).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { searchResults, searchLoading, error, handleSearch, clearSearch, clearError };
}

/**
 * Hook for SDK config handling
 * @param {string} projectId - Project ID
 * @returns {Object} SDK config state and actions
 */
export function useSDKConfig(projectId) {
  const { sdkConfig, sdkConfigLoading, error, getSDK, clearSDK, clearError } = useProject();

  if (!projectId) {
    return EMPTY_SDK_CONFIG;
  }

  const handleFetch = async () => {
    clearError();
    try {
      await getSDK(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { sdkConfig, sdkConfigLoading, error, handleFetch, clearSDK, clearError };
}

/**
 * Hook for project config handling
 * @param {string} projectId - Project ID
 * @returns {Object} Project config state and actions
 */
export function useProjectConfig(projectId) {
  const { projectConfig, configLoading, error, getConfig, updateConfig, clearError } = useProject();

  if (!projectId) {
    return EMPTY_PROJECT_CONFIG;
  }

  const handleFetch = async () => {
    clearError();
    try {
      await getConfig(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleUpdate = async (configData) => {
    clearError();
    try {
      await updateConfig(projectId, configData).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { projectConfig, configLoading, error, handleFetch, handleUpdate, clearError };
}

/**
 * Hook for API key management
 * @param {string} projectId - Project ID
 * @returns {Object} API keys state and actions
 */
export function useProjectApiKeys(projectId) {
  const { apiKeys, apiKeysLoading, error, listApiKeys, generateApiKey, revokeApiKey, clearError } = useProject();

  if (!projectId) {
    return EMPTY_API_KEYS;
  }

  const handleFetch = async () => {
    clearError();
    try {
      await listApiKeys(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleGenerate = async (data) => {
    clearError();
    try {
      const apiKey = await generateApiKey(projectId, data).unwrap();
      return { success: true, data: apiKey };
    } catch (err) {
      const msg = typeof err === 'string' ? err : JSON.stringify(err);
      return { success: false, error: msg };
    }
  };

  const handleRevoke = async (keyId) => {
    clearError();
    try {
      await revokeApiKey(projectId, keyId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { apiKeys, apiKeysLoading, error, handleFetch, handleGenerate, handleRevoke, clearError };
}

export default useProject;