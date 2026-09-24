import axiosInstance from '../../../api/axiosInstance';

/**
 * @typedef {Object} CreateAttributeRequest
 * @property {string} name - Attribute name (1-64 chars, alphanumeric + underscore)
 * @property {string} type - SQL data type (e.g., VARCHAR, INT, TEXT, BOOLEAN)
 * @property {boolean} [required=false] - Whether attribute is required
 */

/**
 * @typedef {Object} Attribute
 * @property {string} id - Attribute ID
 * @property {string} name - Attribute name
 * @property {string} type - SQL data type
 * @property {boolean} required - Whether attribute is required
 * @property {string} collection_id - Collection ID
 * @property {string} database_id - Database ID
 * @property {string} project_id - Project ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} AttributeListResponse
 * @property {Attribute[]} attributes - List of attributes
 * @property {number} count - Total count
 */

/**
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @param {CreateAttributeRequest} data - Attribute creation data
 * @returns {Promise<AxiosResponse<ApiResponse<Attribute>>>}
 */
export const createAttribute = (projectId, collectionId, data) =>
  axiosInstance.post(`/projects/${projectId}/collections/${collectionId}/attributes`, data);

/**
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @returns {Promise<AxiosResponse<ApiResponse<AttributeListResponse>>>}
 */
export const listAttributes = (projectId, collectionId) =>
  axiosInstance.get(`/projects/${projectId}/collections/${collectionId}/attributes`);

/**
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @param {string} attributeId - Attribute ID
 * @param {Partial<CreateAttributeRequest>} data - Attribute update data
 * @returns {Promise<AxiosResponse<ApiResponse<Attribute>>>}
 */
export const updateAttribute = (projectId, collectionId, attributeId, data) =>
  axiosInstance.put(`/projects/${projectId}/collections/${collectionId}/attributes/${attributeId}`, data);

/**
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @param {string} attributeId - Attribute ID
 * @returns {Promise<AxiosResponse<ApiResponse<{ id: string, name: string, deleted: boolean, documents_affected: number }>>>}
 */
export const deleteAttribute = (projectId, collectionId, attributeId) =>
  axiosInstance.delete(`/projects/${projectId}/collections/${collectionId}/attributes/${attributeId}`, {
    data: { confirm: true }
  });

const attributeApi = {
  createAttribute,
  listAttributes,
  updateAttribute,
  deleteAttribute,
};

export default attributeApi;