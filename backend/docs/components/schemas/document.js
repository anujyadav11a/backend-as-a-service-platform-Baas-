export const documentSchemas = {
  Document: {
    type: 'object',
    required: ['id', 'collection_id', 'data', 'created_at', 'project_id'],
    properties: {
      id: { type: 'string', example: 'doc_1703123456789_abc123def' },
      collection_id: { type: 'string', example: 'col_abc123' },
      data: {
        type: 'object',
        additionalProperties: true,
        description: 'Document fields matching collection attribute definitions',
        example: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
          status: 'active'
        }
      },
      created_at: { type: 'string', format: 'date-time' },
      project_id: { type: 'string', example: 'proj_abc123' }
    }
  },
  CreateDocumentRequest: {
    type: 'object',
    description: 'Document fields must match collection attribute definitions. Required fields must be provided.',
    additionalProperties: true,
    example: {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active'
    }
  },
  UpdateDocumentRequest: {
    type: 'object',
    description: 'Partial update - only provided fields will be updated. Must match collection attribute definitions.',
    additionalProperties: true,
    example: {
      name: 'John Updated',
      age: 31,
      status: 'inactive'
    }
  },
  DocumentResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: { $ref: '#/components/schemas/Document' }
    }
  },
  GetDocumentsQuery: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1, example: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 }
    }
  },
  QueryDocumentsRequest: {
    type: 'object',
    required: ['filters'],
    properties: {
      filters: {
        type: 'array',
        items: {
          type: 'object',
          required: ['field', 'operator'],
          properties: {
            field: { type: 'string', example: 'age' },
            operator: { type: 'string', enum: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'contains', 'notContains', 'startsWith', 'endsWith', 'in', 'notIn', 'isNull', 'isNotNull'], example: 'gte' },
            value: { type: ['string', 'number', 'boolean', 'array'], description: 'Value to filter by (not required for isNull/isNotNull)' }
          }
        }
      },
      sort: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'created_at' },
          order: { type: 'string', enum: ['asc', 'desc'], example: 'desc' }
        }
      },
      page: { type: 'integer', minimum: 1, default: 1, example: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 }
    }
  },
  QueryDocumentsResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['documents', 'pagination'],
        properties: {
          documents: {
            type: 'array',
            items: { $ref: '#/components/schemas/Document' }
          },
          pagination: {
            type: 'object',
            required: ['currentPage', 'totalPages', 'totalDocuments', 'hasNextPage', 'hasPrevPage'],
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 5 },
              totalDocuments: { type: 'integer', example: 50 },
              hasNextPage: { type: 'boolean', example: true },
              hasPrevPage: { type: 'boolean', example: false }
            }
          }
        }
      }
    }
  },
  FilterOperators: {
    type: 'object',
    properties: {
      equals: { type: 'string', description: 'Equal to' },
      notEquals: { type: 'string', description: 'Not equal to' },
      greaterThan: { type: 'string', description: 'Greater than' },
      greaterThanOrEqual: { type: 'string', description: 'Greater than or equal to' },
      lessThan: { type: 'string', description: 'Less than' },
      lessThanOrEqual: { type: 'string', description: 'Less than or equal to' },
      contains: { type: 'string', description: 'Contains substring' },
      notContains: { type: 'string', description: 'Does not contain substring' },
      startsWith: { type: 'string', description: 'Starts with' },
      endsWith: { type: 'string', description: 'Ends with' },
      in: { type: 'string', description: 'Value in array' },
      notIn: { type: 'string', description: 'Value not in array' },
      isNull: { type: 'string', description: 'Field is null' },
      isNotNull: { type: 'string', description: 'Field is not null' }
    }
  }
};