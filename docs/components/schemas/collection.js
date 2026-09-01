export const collectionSchemas = {
  Collection: {
    type: 'object',
    required: ['collection_id', 'name', 'databaseId', 'createdAt', 'updatedAt'],
    properties: {
      collection_id: { type: 'string', example: 'col_abc123' },
      name: { type: 'string', example: 'users_collection' },
      description: { type: 'string', nullable: true, example: 'Collection for user data' },
      databaseId: { type: 'string', example: 'db_abc123' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateCollectionRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-zA-Z][a-zA-Z0-9_]*$', example: 'users_collection' },
      description: { type: 'string', maxLength: 500, nullable: true, example: 'Collection for user data' }
    }
  },
  CollectionListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Collection' }
      }
    }
  }
};