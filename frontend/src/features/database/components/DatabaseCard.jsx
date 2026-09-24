import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSingleDatabase } from '../hooks/useDatabase';
import { selectDatabaseLoading } from '../state/databaseSlice';
import { useSelector } from 'react-redux';
import { DatabaseIcon, Trash2Icon, CopyIcon, FolderOpenIcon } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function DatabaseCardComponent({ database, projectId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const { handleRemove } = useSingleDatabase(projectId, database.id);
  const loading = useSelector(selectDatabaseLoading);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    const result = await handleRemove();
    if (result.success) {
      setShowDeleteConfirm(false);
    }
  };

  const handleOpenCollections = () => {
    navigate(`/projects/${projectId}/databases/${database.id}/collections`);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">{database.name}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Database ID</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{database.id}</code>
            <button
              onClick={() => handleCopy(database.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Copy Database ID"
            >
              <CopyIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {formatDate(database.created_at)}</span>
          <span>Updated: {formatDate(database.updated_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={handleOpenCollections}
          disabled={loading}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <FolderOpenIcon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Collections
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          <Trash2Icon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Delete
        </button>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          databaseName={database.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

export const DatabaseCard = memo(DatabaseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.database.id === nextProps.database.id &&
    prevProps.database.name === nextProps.database.name &&
    prevProps.database.created_at === nextProps.database.created_at &&
    prevProps.database.updated_at === nextProps.database.updated_at &&
    prevProps.projectId === nextProps.projectId
  );
});

export default DatabaseCard;