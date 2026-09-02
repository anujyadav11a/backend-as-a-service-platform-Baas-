export const databaseSchemas = {
  Database: {
    type: 'object',
    required: ['database_id', 'name', 'projectId', 'createdAt', 'updatedAt'],
    properties: {
      database_id: { type: 'string', example: 'db_abc123' },
      name: { type: 'string', example: 'my_database' },
      description: { type: 'string', nullable: true, example: 'Database description' },
      projectId: { type: 'string', example: 'proj_abc123' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateDatabaseRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-zA-Z][a-zA-Z0-9_]*$', example: 'my_database' },
      description: { type: 'string', maxLength: 500, nullable: true, example: 'Database description' }
    }
  },
  DatabaseListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Database' }
      }
    }
  }
};