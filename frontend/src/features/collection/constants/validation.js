export const COLLECTION_VALIDATION = {
  name: {
    required: 'Collection name is required',
    maxLength: { value: 255, message: 'Collection name must be at most 255 characters' },
  },
  description: {
    maxLength: { value: 500, message: 'Description must be at most 500 characters' },
  },
};