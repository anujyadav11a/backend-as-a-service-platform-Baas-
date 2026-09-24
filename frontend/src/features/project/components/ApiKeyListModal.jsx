import { useState } from 'react';
import { XIcon, CopyIcon, CheckIcon, Trash2Icon, PlusIcon } from 'lucide-react';
import CreateApiKeyModal from './CreateApiKeyModal';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function maskKey(key) {
  if (!key) return '••••••••••••••••';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

export function ApiKeyListModal({ projectName, onClose, apiKeys, loading, onGenerate, onRevoke }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  const handleCopy = async (text, keyId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="apikey-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 id="apikey-modal-title" className="text-lg font-semibold text-gray-900">API Keys - {projectName}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500" aria-label="Close">
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-4">
            <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Generate New Key
            </button>
          </div>

          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded p-4 h-16"></div>
              ))}
            </div>
          ) : apiKeys.filter(key => !key.revoked).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No API keys yet. Generate one to start using the API.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.filter(key => !key.revoked).map((key) => (
                <div key={key.key_id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{key.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-200 rounded">{key.environment}</span>
                        <span className="px-2 py-0.5 bg-gray-200 rounded">{key.permissions.join(', ')}</span>
                        {key.revoked && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Revoked</span>}
                      </div>
                    </div>
                    {!key.revoked && (
                      <button
                        onClick={() => onRevoke(key.key_id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        aria-label={`Revoke ${key.name}`}
                      >
                        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-2 py-1 border border-gray-200 rounded text-xs font-mono">{maskKey(key.api_key)}</code>
                    <button
                      onClick={() => handleCopy(key.api_key, key.key_id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={copiedKeyId === key.key_id ? 'Copied!' : 'Copy API key'}
                    >
                      {copiedKeyId === key.key_id ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {formatDate(key.created_at)}
                    {key.lastUsedAt && ` • Last used: ${formatDate(key.lastUsedAt)}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCreateModal && (
            <CreateApiKeyModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={onGenerate}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiKeyListModal;