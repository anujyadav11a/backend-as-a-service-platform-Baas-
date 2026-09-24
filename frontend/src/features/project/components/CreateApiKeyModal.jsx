import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XIcon, CopyIcon, CheckIcon } from 'lucide-react';

export function CreateApiKeyModal({ isOpen, onClose, onSubmit, loading }) {
  const [submitError, setSubmitError] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      permissions: ['read'],
      environment: 'development',
    },
  });

  const [permissions, setPermissions] = useState(['read']);

  const handlePermissionChange = (perm) => {
    const newPermissions = permissions.includes(perm)
      ? permissions.filter((p) => p !== perm)
      : [...permissions, perm];
    setPermissions(newPermissions);
    setValue('permissions', newPermissions, { shouldValidate: true });
  };

  const onFormSubmit = async (data) => {
    setSubmitError('');
    setGeneratedKey(null);
    const result = await onSubmit(data);
    
    
    const payload = result.data || result;
  
    const apiKey = payload.api_key || payload.apiKey || payload.key || payload.api_key_value || payload.access_token || payload.token;
    if (result.success && apiKey) {
      setGeneratedKey({ ...payload, api_key: apiKey });
    } else {
      setSubmitError(result.error || 'Failed to generate API key');
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="create-apikey-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 id="create-apikey-modal-title" className="text-lg font-semibold text-gray-900">Generate New API Key</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500" aria-label="Close modal">
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {generatedKey ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">API Key Generated Successfully</h3>
                <p className="text-sm text-green-700 mb-3">This is the only time the full key will be displayed. Copy and store it securely.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedKey.api_key}
                    readOnly
                    className="flex-1 bg-white px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopy(generatedKey.api_key)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors"
                    aria-label={copied ? 'Copied!' : 'Copy API Key'}
                  >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-green-600 mt-2">Key ID: {generatedKey.key_id}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setGeneratedKey(null);
                    reset();
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit(onFormSubmit)} className="space-y-4" noValidate>
              {(submitError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                  {submitError}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  required
                  aria-required="true"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  aria-invalid={!!errors.name}
                  {...register('name', {
                    required: 'Key name is required',
                    maxLength: { value: 100, message: 'Name must be at most 100 characters' },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Production Key"
                  disabled={loading}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <div className="flex gap-4">
                  {['read', 'write', 'admin'].map((perm) => (
                    <label key={perm} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <select
                  id="environment"
                  {...register('environment')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate Key'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateApiKeyModal;