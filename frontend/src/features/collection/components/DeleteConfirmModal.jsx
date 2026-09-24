import { XIcon, AlertTriangleIcon } from 'lucide-react';

export function DeleteConfirmModal({ collectionName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-900">Delete Collection</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500" aria-label="Close modal">
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <AlertTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-gray-700">
                Are you sure you want to delete <strong className="text-gray-900">{collectionName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. All documents and attributes in this collection will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              aria-busy={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Collection'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;