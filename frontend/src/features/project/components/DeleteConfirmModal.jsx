export function DeleteConfirmModal({ projectName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone and will permanently delete all associated databases and data.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;