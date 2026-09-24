import { useState } from 'react';
import { XIcon, CopyIcon, CheckIcon } from 'lucide-react';

export function SDKConfigModal({ config, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!config) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="sdk-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="sdk-modal-title" className="text-lg font-semibold text-gray-900">SDK Configuration</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500" aria-label="Close">
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
              <div className="flex gap-2">
                <input type="text" value={config.project_id} readOnly className="flex-1 bg-gray-100 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                <button
                  onClick={() => handleCopy(config.project_id, 'project_id')}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 text-sm transition-colors"
                  aria-label={copiedField === 'project_id' ? 'Copied!' : 'Copy Project ID'}
                >
                  {copiedField === 'project_id' ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="flex gap-2">
                <input type="text" value={config.api_key} readOnly className="flex-1 bg-gray-100 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                <button
                  onClick={() => handleCopy(config.api_key, 'api_key')}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 text-sm transition-colors"
                  aria-label={copiedField === 'api_key' ? 'Copied!' : 'Copy API Key'}
                >
                  {copiedField === 'api_key' ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <div className="flex gap-2">
                <input type="text" value={config.api_endpoint} readOnly className="flex-1 bg-gray-100 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono" />
                <button
                  onClick={() => handleCopy(config.api_endpoint, 'api_endpoint')}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 text-sm transition-colors"
                  aria-label={copiedField === 'api_endpoint' ? 'Copied!' : 'Copy Base URL'}
                >
                  {copiedField === 'api_endpoint' ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
              <strong>Important:</strong> Your API key is shown only once. Store it securely. You can generate new keys in the API Keys section.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SDKConfigModal;