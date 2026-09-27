export const collectionSchemas = {
  Collection: {
    type: 'object',
    required: ['id', 'name', 'database_id', 'project_id', 'created_at', 'updated_at'],
    properties: {
      id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
      name: { type: 'string', example: 'users_collection' },
      database_id: { type: 'string', example: 'db_abc123' },
      project_id: { type: 'string', example: 'proj_abc123' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  CreateCollectionRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255, example: 'users_collection' },
      description: { type: 'string', maxLength: 500, nullable: true, example: 'Collection for user data' }
    }
  },
  CollectionListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['database_id', 'project_id', 'total_collections', 'collections'],
        properties: {
          database_id: { type: 'string', example: 'db_abc123' },
          project_id: { type: 'string', example: 'proj_abc123' },
          total_collections: { type: 'integer', example: 5 },
          collections: {
            type: 'array',
            items: { $ref: '#/components/schemas/Collection' }
          }
        }
      }
    }
  }
};