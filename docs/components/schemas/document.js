export const documentSchemas = {
  Document: {
    type: 'object',
    required: ['documentId', 'createdAt', 'updatedAt'],
    properties: {
      documentId: { type: 'string', example: 'doc_abc123' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    description: 'Dynamic document with fields defined by collection attributes. Additional properties allowed based on collection schema.'
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
    required: ['filters', 'sort', 'page', 'limit'],
    properties: {
      filters: {
        type: 'object',
        description: 'Filter conditions using MongoDB-style operators',
        additionalProperties: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
            {
              type: 'object',
              properties: {
                $eq: { type: ['string', 'number', 'boolean'] },
                $ne: { type: ['string', 'number', 'boolean'] },
                $gt: { type: ['string', 'number'] },
                $gte: { type: ['string', 'number'] },
                $lt: { type: ['string', 'number'] },
                $lte: { type: ['string', 'number'] },
                $like: { type: 'string', description: 'SQL LIKE pattern (e.g., "John%")' },
                $in: { type: 'array', items: { type: ['string', 'number'] } }
              }
            }
          ]
        },
        example: {
          age: { $gte: 18, $lte: 65 },
          status: 'active',
          name: { $like: 'John%' }
        }
      },
      sort: {
        type: 'object',
        required: ['field', 'order'],
        properties: {
          field: { type: 'string', example: 'createdAt' },
          order: { type: 'string', enum: ['ASC', 'DESC'], example: 'DESC' }
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
          pagination: { $ref: '#/components/schemas/PaginationMeta' }
        }
      }
    }
  },
  FilterOperators: {
    type: 'object',
    properties: {
      $eq: { type: 'string', description: 'Equal to' },
      $ne: { type: 'string', description: 'Not equal to' },
      $gt: { type: 'string', description: 'Greater than' },
      $gte: { type: 'string', description: 'Greater than or equal to' },
      $lt: { type: 'string', description: 'Less than' },
      $lte: { type: 'string', description: 'Less than or equal to' },
      $like: { type: 'string', description: 'Pattern matching (SQL LIKE)' },
      $in: { type: 'string', description: 'Value in array' }
    }
  }
};