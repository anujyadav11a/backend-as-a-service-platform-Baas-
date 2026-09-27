export const projectSchemas = {
  Project: {
    type: 'object',
    required: ['id', 'project_id', 'name', 'status', 'created_at', 'updated_at'],
    properties: {
      id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
      project_id: { type: 'string', pattern: '^[a-f0-9]{8}$', example: 'abc123de' },
      name: { type: 'string', minLength: 2, maxLength: 100, example: 'My Project' },
      description: { type: 'string', nullable: true, example: 'Project description' },
      api_key: { type: 'string', example: 'a1b2c3d4e5f6...' },
      api_endpoint: { type: 'string', format: 'uri', example: 'http://localhost:20000/api/v1/abc123de' },
      status: { type: 'string', enum: ['active', 'suspended', 'deleted'], example: 'active' },
      config: {
        type: 'object',
        nullable: true,
        properties: {
          max_databases: { type: 'integer', minimum: 1, maximum: 50, example: 3 },
          max_tables_per_db: { type: 'integer', minimum: 1, maximum: 500, example: 10 },
          max_documents_per_table: { type: 'integer', minimum: 1, maximum: 100000, example: 1000 },
          cors_origins: { type: 'array', items: { type: 'string' }, example: ['https://app.example.com'] }
        }
      },
      usage: {
        type: 'object',
        nullable: true,
        properties: {
          api_requests: { type: 'integer', example: 150 },
          storage_mb: { type: 'integer', example: 5 }
        }
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  CreateProjectRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100, example: 'My Project' },
      description: { type: 'string', maxLength: 500, nullable: true, example: 'Project description' }
    }
  },
  UpdateProjectRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100, example: 'Updated Project Name' },
      description: { type: 'string', maxLength: 500, nullable: true, example: 'Updated description' }
    }
  },
  ProjectListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Project' }
      }
    }
  },
  SDKDetailsResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['project_id', 'api_key', 'api_endpoint', 'project_name'],
        properties: {
          project_id: { type: 'string', example: 'abc123de' },
          api_key: { type: 'string', example: 'a1b2c3d4e5f6...' },
          api_endpoint: { type: 'string', format: 'uri', example: 'http://localhost:20000/api/v1/abc123de' },
          project_name: { type: 'string', example: 'My Project' }
        }
      }
    }
  },
  ApiKey: {
    type: 'object',
    required: ['key_id', 'api_key', 'name', 'permissions', 'environment', 'revoked', 'created_at'],
    properties: {
      key_id: { type: 'string', example: 'key_abc123def456' },
      api_key: { type: 'string', example: 'a1b2c3d4e5f6...' },
      name: { type: 'string', example: 'Production Key' },
      permissions: { type: 'array', items: { type: 'string', enum: ['read', 'write', 'admin'] }, example: ['read', 'write'] },
      environment: { type: 'string', enum: ['development', 'staging', 'production'], example: 'production' },
      revoked: { type: 'boolean', example: false },
      revoked_at: { type: 'string', format: 'date-time', nullable: true, example: null },
      created_at: { type: 'string', format: 'date-time' }
    }
  },
  CreateApiKeyRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100, example: 'Production Key' },
      permissions: { type: 'array', items: { type: 'string', enum: ['read', 'write', 'admin'] }, default: ['read'], example: ['read', 'write'] },
      environment: { type: 'string', enum: ['development', 'staging', 'production'], default: 'development', example: 'production' }
    }
  },
  ApiKeyGenerateResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['key_id', 'api_key', 'name', 'permissions', 'environment'],
        properties: {
          key_id: { type: 'string', example: 'key_abc123def456' },
          api_key: { type: 'string', example: 'a1b2c3d4e5f6...' },
          name: { type: 'string', example: 'Production Key' },
          permissions: { type: 'array', items: { type: 'string', enum: ['read', 'write', 'admin'] }, example: ['read', 'write'] },
          environment: { type: 'string', enum: ['development', 'staging', 'production'], example: 'production' }
        }
      }
    }
  },
  ApiKeyListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/ApiKey' }
      }
    }
  },
  SearchProjectsRequest: {
    type: 'object',
    properties: {
      q: { type: 'string', description: 'Search term for project name', example: 'my project' }
    }
  },
  ProjectConfig: {
    type: 'object',
    required: ['max_databases', 'max_tables_per_db', 'max_documents_per_table', 'cors_origins'],
    properties: {
      max_databases: { type: 'integer', minimum: 1, maximum: 50, example: 3 },
      max_tables_per_db: { type: 'integer', minimum: 1, maximum: 500, example: 10 },
      max_documents_per_table: { type: 'integer', minimum: 1, maximum: 100000, example: 1000 },
      cors_origins: { type: 'array', items: { type: 'string' }, example: ['https://app.example.com', '*'] }
    }
  },
  UpdateProjectConfigRequest: {
    type: 'object',
    properties: {
      max_databases: { type: 'integer', minimum: 1, maximum: 50, example: 5 },
      max_tables_per_db: { type: 'integer', minimum: 1, maximum: 500, example: 20 },
      max_documents_per_table: { type: 'integer', minimum: 1, maximum: 100000, example: 5000 },
      cors_origins: { type: 'array', items: { type: 'string' }, example: ['https://app.example.com', 'https://admin.example.com'] }
    }
  }
};