import axiosInstance from '../../../api/axiosInstance';

/**
 * @typedef {Object} CreateProjectRequest
 * @property {string} name - Project name (2-100 chars)
 * @property {string} [description] - Project description (max 500 chars)
 */

/**
 * @typedef {Object} UpdateProjectRequest
 * @property {string} [name] - Project name (2-100 chars)
 * @property {string} [description] - Project description (max 500 chars)
 */

/**
 * @typedef {Object} ProjectConfig
 * @property {number} max_databases - Max databases (1-50)
 * @property {number} max_tables_per_db - Max tables per database (1-500)
 * @property {number} max_documents_per_table - Max documents per table (1-100000)
 * @property {string[]} cors_origins - CORS origins (URLs or '*')
 */

/**
 * @typedef {Object} UpdateProjectConfigRequest
 * @property {number} [max_databases] - Max databases (1-50)
 * @property {number} [max_tables_per_db] - Max tables per database (1-500)
 * @property {number} [max_documents_per_table] - Max documents per table (1-100000)
 * @property {string[]} [cors_origins] - CORS origins (URLs or '*')
 */

/**
 * @typedef {Object} CreateApiKeyRequest
 * @property {string} name - API key name (1-100 chars)
 * @property {('read'|'write'|'admin')[]} [permissions] - Permissions array
 * @property {('development'|'staging'|'production')} [environment] - Environment
 */

/**
 * @typedef {Object} Project
 * @property {string} id - MongoDB ObjectId
 * @property {string} project_id - Public project ID (e.g., 'abc123')
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} api_key - Main API key
 * @property {string} api_endpoint - Full API endpoint URL
 * @property {string} status - 'active' | 'suspended' | 'deleted'
 * @property {ProjectConfig} [config] - Project configuration
 * @property {Object} usage - Usage statistics
 * @property {number} usage.api_requests - API request count
 * @property {number} usage.storage_mb - Storage used in MB
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} SDKConfig
 * @property {string} project_id - Public project ID
 * @property {string} api_key - Main API key
 * @property {string} api_endpoint - Full API endpoint URL
 * @property {string} project_name - Project name
 */

/**
 * @typedef {Object} ApiKey
 * @property {string} key_id - Key identifier (e.g., 'key_abc123')
 * @property {string} api_key - Full API key (only shown on creation)
 * @property {string} name - Key name
 * @property {('read'|'write'|'admin')[]} permissions - Permissions
 * @property {('development'|'staging'|'production')} environment - Environment
 * @property {boolean} revoked - Whether key is revoked
 * @property {string} [revoked_at] - Revocation timestamp
 * @property {string} [lastUsedAt] - Last used timestamp
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} SearchProjectsResult
 * @property {string} query - Search query
 * @property {number} count - Number of results
 * @property {Project[]} projects - Matching projects
 */

/**
 * @typedef {Object} ApiResponse<T>
 * @property {boolean} success - Success flag
 * @property {T} data - Response data
 * @property {string} message - Human-readable message
 */

/**
 * @typedef {Object} AxiosResponse<T>
 * @property {T} data - Response data
 * @property {number} status - HTTP status code
 * @property {string} statusText - HTTP status text
 * @property {Object} headers - Response headers
 * @property {Object} config - Request config
 * @property {Object} [request] - Request object
 */

/**
 * @returns {Promise<AxiosResponse<ApiResponse<Project>>>}
 */
export const createProject = (data) =>
  axiosInstance.post('/projects/create', data);

/**
 * @param {string} [fields] - Comma-separated fields to include (e.g., 'config')
 * @returns {Promise<AxiosResponse<ApiResponse<{ projects: Project[] }>>>}
 */
export const listProjects = (fields) => {
  const params = fields ? { fields } : {};
  return axiosInstance.get('/projects/list', { params });
};

/**
 * @param {string} query - Search query
 * @returns {Promise<AxiosResponse<ApiResponse<SearchProjectsResult>>>}
 */
export const searchProjects = (query) =>
  axiosInstance.get('/projects/search', { params: { query } });

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @returns {Promise<AxiosResponse<ApiResponse<Project>>>}
 */
export const getProject = (projectId) =>
  axiosInstance.get(`/projects/${projectId}`);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @param {UpdateProjectRequest} data - Update data
 * @returns {Promise<AxiosResponse<ApiResponse<Project>>>}
 */
export const updateProject = (projectId, data) =>
  axiosInstance.put(`/projects/${projectId}`, data);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @returns {Promise<AxiosResponse<ApiResponse<{ id: string, project_id: string, name: string }>>>}
 */
export const deleteProject = (projectId) =>
  axiosInstance.delete(`/projects/${projectId}`);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @returns {Promise<AxiosResponse<ApiResponse<SDKConfig>>>}
 */
export const getSDKConfig = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/sdk`);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @returns {Promise<AxiosResponse<ApiResponse<ProjectConfig>>>}
 */
export const getProjectConfig = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/config`);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @param {UpdateProjectConfigRequest} configData - Config update data
 * @returns {Promise<AxiosResponse<ApiResponse<ProjectConfig>>>}
 */
export const updateProjectConfig = (projectId, configData) =>
  axiosInstance.patch(`/projects/${projectId}/config`, configData);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @param {CreateApiKeyRequest} data - API key creation data
 * @returns {Promise<AxiosResponse<ApiResponse<ApiKey>>>}
 */
export const generateApiKey = (projectId, data) =>
  axiosInstance.post(`/projects/${projectId}/apikeys`, data);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @returns {Promise<AxiosResponse<ApiResponse<{ keys: ApiKey[] }>>>}
 */
export const listApiKeys = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/apikeys`);

/**
 * @param {string} projectId - Project ID or MongoDB ObjectId
 * @param {string} keyId - API key ID to revoke
 * @returns {Promise<AxiosResponse<ApiResponse<null>>>}
 */
export const revokeApiKey = (projectId, keyId) =>
  axiosInstance.delete(`/projects/${projectId}/apikeys/${keyId}`);

const projectApi = {
  createProject,
  listProjects,
  searchProjects,
  getProject,
  updateProject,
  deleteProject,
  getSDKConfig,
  getProjectConfig,
  updateProjectConfig,
  generateApiKey,
  listApiKeys,
  revokeApiKey,
};

export default projectApi;