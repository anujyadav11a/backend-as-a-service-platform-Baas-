import axiosInstance from '../../../api/axiosInstance';

/**
 * @typedef {Object} CreateDatabaseRequest
 * @property {string} name - Database name (1-255 chars)
 */

/**
 * @typedef {Object} CreateCollectionRequest
 * @property {string} name - Collection name (1-255 chars)
 */

/**
 * @typedef {Object} Database
 * @property {string} id - Database ID
 * @property {string} name - Database name
 * @property {string} project_id - Project ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Collection
 * @property {string} id - Collection ID
 * @property {string} name - Collection name
 * @property {string} database_id - Database ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} DatabaseListResponse
 * @property {string} project_id - Project ID
 * @property {number} total_databases - Total count
 * @property {Database[]} databases - List of databases
 */

/**
 * @typedef {Object} CollectionListResponse
 * @property {string} database_id - Database ID
 * @property {number} total_collections - Total count
 * @property {Collection[]} collections - List of collections
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
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @param {CreateDatabaseRequest} data - Database creation data
 * @returns {Promise<AxiosResponse<ApiResponse<Database>>>}
 */
export const createDatabase = (projectId, data) =>
  axiosInstance.post(`/projects/${projectId}/databases`, data);

/**
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @param {string} databaseId - Database ID
 * @returns {Promise<AxiosResponse<ApiResponse<Database>>>}
 */
export const deleteDatabase = (projectId, databaseId) =>
  axiosInstance.delete(`/projects/${projectId}/databases/${databaseId}`);

/**
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @returns {Promise<AxiosResponse<ApiResponse<DatabaseListResponse>>>}
 */
export const listDatabases = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/databases`);

/**
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @param {string} databaseId - Database ID
 * @returns {Promise<AxiosResponse<ApiResponse<Database>>>}
 */
export const getDatabase = (projectId, databaseId) =>
  axiosInstance.get(`/projects/${projectId}/databases/${databaseId}`);

/**
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @param {string} databaseId - Database ID
 * @param {CreateCollectionRequest} data - Collection creation data
 * @returns {Promise<AxiosResponse<ApiResponse<Collection>>>}
 */
export const createCollection = (projectId, databaseId, data) =>
  axiosInstance.post(`/projects/${projectId}/databases/${databaseId}/collections`, data);

/**
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @param {string} databaseId - Database ID
 * @returns {Promise<AxiosResponse<ApiResponse<CollectionListResponse>>>}
 */
export const listCollections = (projectId, databaseId) =>
  axiosInstance.get(`/projects/${projectId}/databases/${databaseId}/collections`);

const databaseApi = {
  createDatabase,
  deleteDatabase,
  listDatabases,
  getDatabase,
  createCollection,
  listCollections,
};

export default databaseApi;