import { useDispatch, useSelector } from 'react-redux';
import {
  createAttribute,
  fetchAttributes,
  updateAttribute,
  removeAttribute,
  clearAttributeError,
  clearCurrentAttribute,
  clearAttributes,
} from '../state/attributeSlice';
import {
  selectAttributes,
  selectCurrentAttribute,
  selectAttributeLoading,
  selectAttributeError,
} from '../state/attributeSlice';

const ATTRIBUTE_ID_REQUIRED = { success: false, error: { message: 'Attribute ID is required' } };
const COLLECTION_ID_REQUIRED = { success: false, error: { message: 'Collection ID is required' } };

const EMPTY_ATTRIBUTE_LIST = {
  attributes: [],
  loading: false,
  error: 'Collection ID is required',
  handleList: () => Promise.resolve(COLLECTION_ID_REQUIRED),
  handleCreate: () => Promise.resolve(COLLECTION_ID_REQUIRED),
  clearError: () => {},
  clearAll: () => {},
};

const EMPTY_SINGLE_ATTRIBUTE = {
  attribute: null,
  loading: false,
  error: 'Attribute ID is required',
  handleFetch: () => Promise.resolve(ATTRIBUTE_ID_REQUIRED),
  handleUpdate: () => Promise.resolve(ATTRIBUTE_ID_REQUIRED),
  handleRemove: () => Promise.resolve(ATTRIBUTE_ID_REQUIRED),
  clearError: () => {},
  clearCurrent: () => {},
};

/**
 * Hook providing attribute state and actions.
 * @returns {Object} Attribute state and methods
 * @returns {Attribute[]} attributes - List of attributes for current collection
 * @returns {Attribute|null} currentAttribute - Currently selected attribute
 * @returns {boolean} loading - Whether an attribute operation is in progress
 * @returns {string|null} error - Current error message
 * @returns {Function} create - Create attribute function
 * @returns {Function} list - Fetch attributes for collection function
 * @returns {Function} update - Update attribute function
 * @returns {Function} remove - Delete attribute function
 * @returns {Function} clearError - Clear error state
 * @returns {Function} clearCurrent - Clear current attribute state
 * @returns {Function} clearAll - Clear all attributes list
 */
export function useAttribute() {
  const attributes = useSelector(selectAttributes);
  const currentAttribute = useSelector(selectCurrentAttribute);
  const loading = useSelector(selectAttributeLoading);
  const error = useSelector(selectAttributeError);
  const dispatch = useDispatch();

  const create = ({ projectId, collectionId, data }) => dispatch(createAttribute({ projectId, collectionId, data }));
  const list = ({ projectId, collectionId }) => dispatch(fetchAttributes({ projectId, collectionId }));
  const update = ({ projectId, collectionId, attributeId, data }) => dispatch(updateAttribute({ projectId, collectionId, attributeId, data }));
  const remove = ({ projectId, collectionId, attributeId }) => dispatch(removeAttribute({ projectId, collectionId, attributeId }));
  const clearError = () => dispatch(clearAttributeError());
  const clearCurrent = () => dispatch(clearCurrentAttribute());
  const clearAll = () => dispatch(clearAttributes());

  return {
    attributes,
    currentAttribute,
    loading,
    error,
    create,
    list,
    update,
    remove,
    clearError,
    clearCurrent,
    clearAll,
  };
}

/**
 * Hook for attribute list handling - scoped to a collection
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @returns {Object} Attribute list state and actions
 */
export function useAttributeList(projectId, collectionId) {
  const { attributes, loading, error, list, create, clearError, clearAll } = useAttribute();

  if (!projectId || !collectionId) {
    return EMPTY_ATTRIBUTE_LIST;
  }

  const handleList = async () => {
    clearError();
    try {
      await list({ projectId, collectionId }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleCreate = async (data) => {
    clearError();
    try {
      await create({ projectId, collectionId, data }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { attributes, loading, error, handleList, handleCreate, clearError, clearAll };
}

/**
 * Hook for single attribute handling
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @param {string} attributeId - Attribute ID
 * @returns {Object} Single attribute state and actions
 */
export function useSingleAttribute(projectId, collectionId, attributeId) {
  const { currentAttribute, loading, error, update, remove, clearError, clearCurrent } = useAttribute();

  if (!projectId || !collectionId || !attributeId) {
    return EMPTY_SINGLE_ATTRIBUTE;
  }

  const handleUpdate = async (data) => {
    clearError();
    try {
      await update({ projectId, collectionId, attributeId, data }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleRemove = async () => {
    clearError();
    try {
      await remove({ projectId, collectionId, attributeId }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    attribute: currentAttribute,
    loading,
    error,
    handleUpdate,
    handleRemove,
    clearError,
    clearCurrent,
  };
}

export default useAttribute;