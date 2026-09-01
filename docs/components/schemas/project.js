export const projectSchemas = {
  Project: {
    type: 'object',
    required: ['projectId', 'name', 'ownerId', 'createdAt', 'updatedAt'],
    properties: {
      projectId: { type: 'string', pattern: '^proj_[a-zA-Z0-9]+$', example: 'proj_abc123' },
      name: { type: 'string', example: 'My Project' },
      description: { type: 'string', nullable: true, example: 'Project description' },
      ownerId: { type: 'string', example: 'user_abc123' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateProjectRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100, example: 'My Project' },
      description: { type: 'string', maxLength: 500, nullable: true, example: 'Project description' }
    }
  },
  UpdateProjectRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100, example: 'Updated Project Name' },
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
        required: ['projectId', 'apiKey', 'baseUrl'],
        properties: {
          projectId: { type: 'string', example: 'proj_abc123' },
          apiKey: { type: 'string', example: 'baas_live_abc123...' },
          baseUrl: { type: 'string', example: 'http://localhost:20000' }
        }
      }
    }
  },
  ApiKey: {
    type: 'object',
    required: ['keyId', 'keyPrefix', 'name', 'createdAt', 'lastUsedAt'],
    properties: {
      keyId: { type: 'string', example: 'key_abc123' },
      keyPrefix: { type: 'string', example: 'baas_live_ab' },
      name: { type: 'string', example: 'Production Key' },
      createdAt: { type: 'string', format: 'date-time' },
      lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
      expiresAt: { type: 'string', format: 'date-time', nullable: true }
    }
  },
  CreateApiKeyRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 50, example: 'Production Key' },
      expiresInDays: { type: 'integer', minimum: 1, maximum: 365, nullable: true, example: 90 }
    }
  },
  ApiKeyGenerateResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['keyId', 'apiKey', 'keyPrefix', 'name'],
        properties: {
          keyId: { type: 'string', example: 'key_abc123' },
          apiKey: { type: 'string', example: 'baas_live_abc123xyz...' },
          keyPrefix: { type: 'string', example: 'baas_live_ab' },
          name: { type: 'string', example: 'Production Key' }
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
  }
};