import { useDispatch, useSelector } from 'react-redux';
import {
  createDatabase,
  fetchDatabases,
  fetchDatabase,
  removeDatabase,
  clearDatabaseError,
  clearCurrentDatabase,
  clearDatabases,
} from '../state/databaseSlice';
import {
  selectDatabases,
  selectCurrentDatabase,
  selectDatabaseLoading,
  selectDatabaseError,
} from '../state/databaseSlice';

const DATABASE_ID_REQUIRED = { success: false, error: { message: 'Database ID is required' } };
const PROJECT_ID_REQUIRED = { success: false, error: { message: 'Project ID is required' } };

const EMPTY_DATABASE_LIST = {
  databases: [],
  loading: false,
  error: 'Project ID is required',
  handleList: () => Promise.resolve(PROJECT_ID_REQUIRED),
  handleCreate: () => Promise.resolve(PROJECT_ID_REQUIRED),
  clearError: () => {},
  clearAll: () => {},
};

const EMPTY_SINGLE_DATABASE = {
  database: null,
  loading: false,
  error: 'Database ID is required',
  handleFetch: () => Promise.resolve(DATABASE_ID_REQUIRED),
  handleRemove: () => Promise.resolve(DATABASE_ID_REQUIRED),
  clearError: () => {},
  clearCurrent: () => {},
};

/**
 * Hook providing database state and actions.
 * @returns {Object} Database state and methods
 * @returns {Database[]} databases - List of databases for current project
 * @returns {Database|null} currentDatabase - Currently selected database
 * @returns {boolean} loading - Whether a database operation is in progress
 * @returns {string|null} error - Current error message
 * @returns {Function} create - Create database function
 * @returns {Function} list - Fetch databases for project function
 * @returns {Function} get - Fetch single database function
 * @returns {Function} remove - Delete database function
 * @returns {Function} clearError - Clear error state
 * @returns {Function} clearCurrent - Clear current database state
 * @returns {Function} clearAll - Clear all databases list
 */
export function useDatabase() {
  const databases = useSelector(selectDatabases);
  const currentDatabase = useSelector(selectCurrentDatabase);
  const loading = useSelector(selectDatabaseLoading);
  const error = useSelector(selectDatabaseError);
  const dispatch = useDispatch();

  const create = ({ projectId, data }) => dispatch(createDatabase({ projectId, data }));
  const list = (projectId) => dispatch(fetchDatabases(projectId));
  const get = ({ projectId, databaseId }) => dispatch(fetchDatabase({ projectId, databaseId }));
  const remove = ({ projectId, databaseId }) => dispatch(removeDatabase({ projectId, databaseId }));
  const clearError = () => dispatch(clearDatabaseError());
  const clearCurrent = () => dispatch(clearCurrentDatabase());
  const clearAll = () => dispatch(clearDatabases());

  return {
    databases,
    currentDatabase,
    loading,
    error,
    create,
    list,
    get,
    remove,
    clearError,
    clearCurrent,
    clearAll,
  };
}

/**
 * Hook for database list handling - scoped to a project
 * @param {string} projectId - Project ID
 * @returns {Object} Database list state and actions
 */
export function useDatabaseList(projectId) {
  const { databases, loading, error, list, create, clearError, clearAll } = useDatabase();

  if (!projectId) {
    return EMPTY_DATABASE_LIST;
  }

  const handleList = async () => {
    clearError();
    try {
      await list(projectId).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleCreate = async (data) => {
    clearError();
    try {
      await create({ projectId, data }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { databases, loading, error, handleList, handleCreate, clearError, clearAll };
}

/**
 * Hook for single database handling
 * @param {string} projectId - Project ID
 * @param {string} databaseId - Database ID
 * @returns {Object} Single database state and actions
 */
export function useSingleDatabase(projectId, databaseId) {
  const { currentDatabase, loading, error, get, remove, clearError, clearCurrent } = useDatabase();

  if (!projectId || !databaseId) {
    return EMPTY_SINGLE_DATABASE;
  }

  const handleFetch = async () => {
    clearError();
    try {
      await get({ projectId, databaseId }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleRemove = async () => {
    clearError();
    try {
      await remove({ projectId, databaseId }).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    database: currentDatabase,
    loading,
    error,
    handleFetch,
    handleRemove,
    clearError,
    clearCurrent,
  };
}

export default useDatabase;