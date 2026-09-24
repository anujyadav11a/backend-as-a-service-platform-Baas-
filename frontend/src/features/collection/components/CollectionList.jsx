import { useEffect, useState } from 'react';
import { useCollectionList } from '../hooks/useCollection';
import { fetchCollections } from '../state/collectionSlice';
import { useDispatch } from 'react-redux';
import CollectionCard from './CollectionCard';
import CreateCollectionModal from './CreateCollectionModal';
import { DatabaseIcon, PlusIcon } from 'lucide-react';

export default function CollectionList({ projectId, databaseId, databaseName }) {
  const dispatch = useDispatch();
  const { collections, loading, error, handleCreate } = useCollectionList(projectId, databaseId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (projectId && databaseId) {
      dispatch(fetchCollections({ projectId, databaseId }));
    }
  }, [dispatch, projectId, databaseId]);

  const handleCreateSubmit = async (data) => {
    const result = await handleCreate(data);
    if (result.success) {
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
          <p className="text-gray-600 mt-1">Manage collections for <span className="font-medium">{databaseName}</span></p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          New Collection
        </button>
      </div>

      {(error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
          {error}
        </div>
      ))}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && collections.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DatabaseIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No collections yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new collection.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Create Collection
          </button>
        </div>
      )}

      {!loading && collections.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={`Collections for ${databaseName}`}>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} projectId={projectId} />
          ))}
        </div>
      )}

      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        loading={loading}
      />
    </div>
  );
}