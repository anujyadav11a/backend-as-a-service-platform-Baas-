export const databaseSchemas = {
  Database: {
    type: 'object',
    required: ['id', 'name', 'project_id', 'created_at', 'updated_at'],
    properties: {
      id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
      name: { type: 'string', example: 'my_database' },
      project_id: { type: 'string', example: 'proj_abc123' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  CreateDatabaseRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255, example: 'my_database' }
    }
  },
  DatabaseListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['project_id', 'total_databases', 'databases'],
        properties: {
          project_id: { type: 'string', example: 'proj_abc123' },
          total_databases: { type: 'integer', example: 2 },
          databases: {
            type: 'array',
            items: { $ref: '#/components/schemas/Database' }
          }
        }
      }
    }
  }
};