export const PROJECT_VALIDATION = {
  name: {
    required: 'Project name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be at most 100 characters' },
  },
  description: {
    maxLength: { value: 500, message: 'Description must be at most 500 characters' },
  },
};

export const API_KEY_VALIDATION = {
  name: {
    required: 'Key name is required',
    maxLength: { value: 100, message: 'Name must be at most 100 characters' },
  },
};