import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XIcon, ChevronDownIcon } from 'lucide-react';
import { ATTRIBUTE_VALIDATION, ATTRIBUTE_TYPES } from '../constants/validation';

export function CreateAttributeModal({ isOpen, onClose, onSubmit, loading }) {
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      required: false,
    },
  });

  const onFormSubmit = async (data) => {
    setSubmitError('');
    const result = await onSubmit(data);
    if (result.success) {
      reset({ required: false });
    } else {
      setSubmitError(result.error || 'Failed to create attribute');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 id="create-modal-title" className="text-lg font-semibold text-gray-900">Create New Attribute</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500" aria-label="Close modal">
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit(onFormSubmit)} className="space-y-6" noValidate>
            {(submitError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                {submitError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Attribute Name <span aria-hidden="true">*</span>
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
                {...register('name', ATTRIBUTE_VALIDATION.name)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="email"
                disabled={loading}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Must start with a letter or underscore. Max 64 characters.</p>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Data Type <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="type"
                  name="type"
                  type="text"
                  autoComplete="off"
                  required
                  aria-required="true"
                  aria-describedby={errors.type ? 'type-error' : 'type-help'}
                  aria-invalid={!!errors.type}
                  {...register('type', ATTRIBUTE_VALIDATION.type)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Select or type a data type (e.g., VARCHAR(255))"
                  disabled={loading}
                  list="type-suggestions"
                />
                <datalist id="type-suggestions">
                  {ATTRIBUTE_TYPES.flatMap(group => group.options).map(opt => (
                    <option key={opt.value} value={opt.value} />
                  ))}
                </datalist>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              {errors.type && (
                <p id="type-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.type.message}
                </p>
              )}
              <p id="type-help" className="mt-1 text-xs text-gray-500">Examples: VARCHAR(255), INT, TEXT, BOOLEAN, DECIMAL(10,2), ENUM('a','b')</p>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  id="required"
                  name="required"
                  type="checkbox"
                  {...register('required', ATTRIBUTE_VALIDATION.required)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  disabled={loading}
                />
                <label htmlFor="required" className="ml-3 block text-sm font-medium text-gray-700">
                  Required
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">When enabled, this attribute must have a value for every document.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                    Creating...
                  </span>
                ) : (
                  'Create Attribute'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAttributeModal;