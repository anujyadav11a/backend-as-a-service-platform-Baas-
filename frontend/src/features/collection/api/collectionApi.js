import axiosInstance from '../../../api/axiosInstance';

/**
 * @typedef {Object} CreateCollectionRequest
 * @property {string} name - Collection name (1-255 chars)
 * @property {string} [description] - Collection description (max 500 chars)
 */

/**
 * @typedef {Object} Collection
 * @property {string} id - Collection ID (UUID)
 * @property {string} name - Collection name
 * @property {string} database_id - Database ID
 * @property {string} project_id - Project ID
 * @property {string} [description] - Collection description
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} CollectionListResponse
 * @property {string} database_id - Database ID
 * @property {string} project_id - Project ID
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

/**
 * @param {string} projectId - Public project ID (e.g., 'abc123')
 * @param {string} collectionId - Collection ID
 * @returns {Promise<AxiosResponse<ApiResponse<{ id: string, name: string, database_id: string, project_id: string }>>>}
 */
export const deleteCollection = (projectId, collectionId) =>
  axiosInstance.delete(`/${projectId}/collections/${collectionId}`);

const collectionApi = {
  createCollection,
  listCollections,
  deleteCollection,
};

export default collectionApi;