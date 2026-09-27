import { authSchemas } from './auth.js';
import { projectSchemas } from './project.js';
import { databaseSchemas } from './database.js';
import { collectionSchemas } from './collection.js';
import { attributeSchemas } from './attribute.js';
import { documentSchemas } from './document.js';

// Response schemas (previously misplaced in components.responses)
const responseSchemas = {
  SuccessResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' }
    }
  },
  ErrorResponse: {
    type: 'object',
    required: ['success', 'error'],
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Request validation failed' },
          details: { type: 'object', description: 'Optional field-level error details' }
        }
      }
    }
  },
  ValidationError: {
    type: 'object',
    required: ['success', 'error'],
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        required: ['code', 'message', 'details'],
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Request validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  PaginationResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['documents', 'pagination'],
        properties: {
          documents: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            required: ['currentPage', 'totalPages', 'totalDocuments', 'limit'],
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 5 },
              totalDocuments: { type: 'integer', example: 50 },
              limit: { type: 'integer', example: 10 }
            }
          }
        }
      }
    }
  },
  PaginationMeta: {
    type: 'object',
    required: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage'],
    properties: {
      currentPage: { type: 'integer' },
      totalPages: { type: 'integer' },
      totalItems: { type: 'integer' },
      itemsPerPage: { type: 'integer' }
    }
  }
};

export const schemas = {
  ...authSchemas,
  ...projectSchemas,
  ...databaseSchemas,
  ...collectionSchemas,
  ...attributeSchemas,
  ...documentSchemas,
  ...responseSchemas
};