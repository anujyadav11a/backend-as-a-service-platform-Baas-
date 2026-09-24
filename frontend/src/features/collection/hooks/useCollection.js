import { useDispatch, useSelector } from 'react-redux';
import {
  createCollection,
  fetchCollections,
  removeCollection,
  clearCollectionError,
  clearCurrentCollection,
  clearCollections,
} from '../state/collectionSlice';
import {
  selectCollections,
  selectCurrentCollection,
  selectCollectionLoading,
  selectCollectionError,
} from '../state/collectionSlice';

const COLLECTION_ID_REQUIRED = { success: false, error: { message: 'Collection ID is required' } };
const DATABASE_ID_REQUIRED = { success: false, error: { message: 'Database ID is required' } };

const EMPTY_COLLECTION_LIST = {
  collections: [],
  loading: false,
  error: 'Database ID is required',
  handleList: () => Promise.resolve(DATABASE_ID_REQUIRED),
  handleCreate: () => Promise.resolve(DATABASE_ID_REQUIRED),
  clearError: () => {},
  clearAll: () => {},
};

const EMPTY_SINGLE_COLLECTION = {
  collection: null,
  loading: false,
  error: 'Collection ID is required',
  handleFetch: () => Promise.resolve(COLLECTION_ID_REQUIRED),
  handleRemove: () => Promise.resolve(COLLECTION_ID_REQUIRED),
  clearError: () => {},
  clearCurrent: () => {},
};

/**
 * Hook providing collection state and actions.
 * @returns {Object} Collection state and methods
 * @returns {Collection[]} collections - List of collections for current database
 * @returns {Collection|null} currentCollection - Currently selected collection
 * @returns {boolean} loading - Whether a collection operation is in progress
 * @returns {string|null} error - Current error message
 * @returns {Function} create - Create collection function
 * @returns {Function} list - Fetch collections for database function
 * @returns {Function} remove - Delete collection function
 * @returns {Function} clearError - Clear error state
 * @returns {Function} clearCurrent - Clear current collection state
 * @returns {Function} clearAll - Clear all collections list
 */
export function useCollection() {
  const collections = useSelector(selectCollections);
  const currentCollection = useSelector(selectCurrentCollection);
  const loading = useSelector(selectCollectionLoading);
  const error = useSelector(selectCollectionError);
  const dispatch = useDispatch();

  const create = ({ projectId, databaseId, data }) => dispatch(createCollection({ projectId, databaseId, data }));
  const list = ({ projectId, databaseId }) => dispatch(fetchCollections({ projectId, databaseId }));
  const remove = ({ projectId, collectionId }) => dispatch(removeCollection({ projectId, collectionId }));
  const clearError = () => dispatch(clearCollectionError());
  const clearCurrent = () => dispatch(clearCurrentCollection());
  const clearAll = () => dispatch(clearCollections());

  return {
    collections,
    currentCollection,
    loading,
    error,
    create,
    list,
    remove,
    clearError,
    clearCurrent,
    clearAll,
  };
}

/**
 * Hook for collection list handling - scoped to a database
 * @param {string} projectId - Project ID
 * @param {string} databaseId - Database ID
 * @returns {Object} Collection list state and actions
 */
export function useCollectionList(projectId, databaseId) {
  const { collections, loading, error, list, create, clearError, clearAll } = useCollection();

  if (!projectId || !databaseId) {
    return EMPTY_COLLECTION_LIST;
  }

  const handleList = async () => {
    clearError();
    try {
      await list({ projectId, databaseId }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleCreate = async (data) => {
    clearError();
    try {
      await create({ projectId, databaseId, data }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { collections, loading, error, handleList, handleCreate, clearError, clearAll };
}

/**
 * Hook for single collection handling
 * @param {string} projectId - Project ID
 * @param {string} collectionId - Collection ID
 * @returns {Object} Single collection state and actions
 */
export function useSingleCollection(projectId, collectionId) {
  const { currentCollection, loading, error, remove, clearError, clearCurrent } = useCollection();

  if (!projectId || !collectionId) {
    return EMPTY_SINGLE_COLLECTION;
  }

  const handleRemove = async () => {
    clearError();
    try {
      await remove({ projectId, collectionId }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    collection: currentCollection,
    loading,
    error,
    handleRemove,
    clearError,
    clearCurrent,
  };
}

export default useCollection;