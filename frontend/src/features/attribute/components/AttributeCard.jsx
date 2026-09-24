import { useState, memo } from 'react';
import { useSingleAttribute } from '../hooks/useAttribute';
import { selectAttributeLoading } from '../state/attributeSlice';
import { useSelector } from 'react-redux';
import { DatabaseIcon, Trash2Icon, CopyIcon, Edit2Icon } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditAttributeModal from './EditAttributeModal';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTypeBadge(type) {
  const baseType = type.split('(')[0].toUpperCase();
  
  if (['VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT'].includes(baseType)) {
    return { color: 'bg-blue-100 text-blue-800', label: 'String' };
  }
  if (['INT', 'BIGINT', 'SMALLINT', 'MEDIUMINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL'].includes(baseType)) {
    return { color: 'bg-green-100 text-green-800', label: 'Number' };
  }
  if (['DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'].includes(baseType)) {
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Date/Time' };
  }
  if (['BOOLEAN', 'BOOL'].includes(baseType)) {
    return { color: 'bg-purple-100 text-purple-800', label: 'Boolean' };
  }
  if (['JSON'].includes(baseType)) {
    return { color: 'bg-orange-100 text-orange-800', label: 'JSON' };
  }
  if (['BLOB', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB', 'BINARY', 'VARBINARY'].includes(baseType)) {
    return { color: 'bg-gray-100 text-gray-800', label: 'Binary' };
  }
  if (['ENUM', 'SET'].includes(baseType)) {
    return { color: 'bg-pink-100 text-pink-800', label: 'Enum/Set' };
  }
  return { color: 'bg-gray-100 text-gray-800', label: baseType };
}

function AttributeCardComponent({ attribute, projectId, collectionId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { handleUpdate, handleRemove } = useSingleAttribute(projectId, collectionId, attribute.id);
  const loading = useSelector(selectAttributeLoading);

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

  const handleEdit = async (data) => {
    const result = await handleUpdate(data);
    if (result.success) {
      setShowEditModal(false);
    }
  };

  const typeBadge = getTypeBadge(attribute.type);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <DatabaseIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">{attribute.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeBadge.color}`}>
              {typeBadge.label}
            </span>
            {attribute.required && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Type</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{attribute.type}</code>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Attribute ID</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{attribute.id}</code>
            <button
              onClick={() => handleCopy(attribute.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Copy Attribute ID"
            >
              <CopyIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {formatDate(attribute.created_at)}</span>
          <span>Updated: {formatDate(attribute.updated_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={loading}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <Edit2Icon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Edit
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
          attributeName={attribute.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={loading}
        />
      )}

      {showEditModal && (
        <EditAttributeModal
          attribute={attribute}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          loading={loading}
        />
      )}
    </div>
  );
}

export const AttributeCard = memo(AttributeCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.attribute.id === nextProps.attribute.id &&
    prevProps.attribute.name === nextProps.attribute.name &&
    prevProps.attribute.type === nextProps.attribute.type &&
    prevProps.attribute.required === nextProps.attribute.required &&
    prevProps.attribute.created_at === nextProps.attribute.created_at &&
    prevProps.attribute.updated_at === nextProps.attribute.updated_at &&
    prevProps.projectId === nextProps.projectId &&
    prevProps.collectionId === nextProps.collectionId
  );
});

export default AttributeCard;