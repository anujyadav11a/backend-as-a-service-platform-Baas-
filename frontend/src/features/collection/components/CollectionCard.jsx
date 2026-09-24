import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSingleCollection } from '../hooks/useCollection';
import { selectCollectionLoading } from '../state/collectionSlice';
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

function CollectionCardComponent({ collection, projectId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const { handleRemove } = useSingleCollection(projectId, collection.id);

  const loading = useSelector(selectCollectionLoading);

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

  const handleOpenAttributes = () => {
    navigate(`/projects/${projectId}/collections/${collection.id}/attributes`);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">{collection.name}</h3>
          </div>
          {collection.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{collection.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Collection ID</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{collection.id}</code>
            <button
              onClick={() => handleCopy(collection.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Copy Collection ID"
            >
              <CopyIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {formatDate(collection.created_at)}</span>
          <span>Updated: {formatDate(collection.updated_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={handleOpenAttributes}
          disabled={loading}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <FolderOpenIcon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Attributes
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
          collectionName={collection.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

export const CollectionCard = memo(CollectionCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.collection.id === nextProps.collection.id &&
    prevProps.collection.name === nextProps.collection.name &&
    prevProps.collection.description === nextProps.collection.description &&
    prevProps.collection.created_at === nextProps.collection.created_at &&
    prevProps.collection.updated_at === nextProps.collection.updated_at &&
    prevProps.projectId === nextProps.projectId
  );
});

export default CollectionCard;