import { useState, memo } from 'react';
import { useProject, useProjectApiKeys } from '../hooks/useProject';
import { selectSDKConfig, selectApiKeys, selectProjectLoading, selectSDKConfigLoading, selectApiKeysLoading } from '../state/projectSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CopyIcon, ExternalLinkIcon, SettingsIcon, Trash2Icon, KeyIcon, CheckIcon, DatabaseIcon } from 'lucide-react';
import SDKConfigModal from './SDKConfigModal';
import ApiKeyListModal from './ApiKeyListModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditProjectModal from './EditProjectModal';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

function ProjectCardComponent({ project }) {
  const [showSDK, setShowSDK] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  // Single useProject() call - gets all actions
  const { update, remove, getSDK, listApiKeys } = useProject();
  
  // Use useProjectApiKeys for proper handleGenerate/handleRevoke with unwrapping
  const { handleGenerate, handleRevoke } = useProjectApiKeys(project.id);

  // Specific selectors - only subscribes to what this card needs
  const sdkConfig = useSelector(selectSDKConfig);
  const apiKeys = useSelector(selectApiKeys);
  const loading = useSelector(selectProjectLoading);
  const sdkConfigLoading = useSelector(selectSDKConfigLoading);
  const apiKeysLoading = useSelector(selectApiKeysLoading);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFetchSDK = async () => {
    await getSDK(project.id);
    setShowSDK(true);
  };

  const handleFetchApiKeys = async () => {
    await listApiKeys(project.id);
    setShowApiKeys(true);
  };

  const handleDelete = async () => {
    const result = await remove(project.id);
    if (result.success) {
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSubmit = async (data) => {
    const result = await update(project.id, data);
    if (result.success) {
      setShowEditModal(false);
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    deleted: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <p className="mt-1 text-sm text-gray-500 truncate">{project.description || 'No description'}</p>
        </div>
        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
          {project.status}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Project ID</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{project.project_id}</code>
            <button
              onClick={() => handleCopy(project.project_id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Copy Project ID"
            >
              <CopyIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">API Key</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{maskApiKey(project.api_key)}</code>
            <button
              onClick={() => handleCopy(project.api_key)}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label={copied ? 'Copied!' : 'Copy API Key'}
            >
              {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Endpoint</span>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono truncate max-w-[150px]">{project.api_endpoint}</code>
            <a
              href={project.api_endpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Open API endpoint"
            >
              <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {formatDate(project.created_at)}</span>
          <span>Updated: {formatDate(project.updated_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={handleFetchSDK}
          disabled={sdkConfigLoading}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <KeyIcon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          SDK Config
        </button>

        <button
          onClick={handleFetchApiKeys}
          disabled={apiKeysLoading}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <KeyIcon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          API Keys
        </button>

        <button
          onClick={() => navigate(`/projects/${project.project_id}/databases`)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <DatabaseIcon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Databases
        </button>

        <button
          onClick={() => setShowEditModal(true)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <SettingsIcon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Settings
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <Trash2Icon className="h-4 w-4 mr-1 inline" aria-hidden="true" />
          Delete
        </button>
      </div>

      {showSDK && sdkConfig && (
        <SDKConfigModal
          config={sdkConfig}
          onClose={() => setShowSDK(false)}
        />
      )}

{showApiKeys && (
        <ApiKeyListModal
          projectName={project.name}
          onClose={() => setShowApiKeys(false)}
          apiKeys={apiKeys}
          loading={apiKeysLoading}
          onGenerate={handleGenerate}
          onRevoke={handleRevoke}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          projectName={project.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={loading}
        />
      )}

      {showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          initialData={{ name: project.name, description: project.description }}
          loading={loading}
        />
      )}
    </div>
  );
}

export const ProjectCard = memo(ProjectCardComponent, (prevProps, nextProps) => {
  // Only re-render if project data actually changed
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.status === nextProps.project.status &&
    prevProps.project.description === nextProps.project.description &&
    prevProps.project.api_key === nextProps.project.api_key &&
    prevProps.project.project_id === nextProps.project.project_id &&
    prevProps.project.api_endpoint === nextProps.project.api_endpoint &&
    prevProps.project.created_at === nextProps.project.created_at &&
    prevProps.project.updated_at === nextProps.project.updated_at
  );
});

export default ProjectCard;