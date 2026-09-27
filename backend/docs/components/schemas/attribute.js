export const attributeSchemas = {
  Attribute: {
    type: 'object',
    required: ['id', 'name', 'type', 'required', 'collection_id', 'database_id', 'created_at', 'updated_at'],
    properties: {
      id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
      name: { type: 'string', example: 'email' },
      type: { type: 'string', example: 'VARCHAR(255)' },
      required: { type: 'boolean', example: true },
      collection_id: { type: 'string', example: 'col_abc123' },
      database_id: { type: 'string', example: 'db_abc123' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  CreateAttributeRequest: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', example: 'email' },
      type: { type: 'string', example: 'VARCHAR(255)' },
      required: { type: 'boolean', default: false, example: true }
    }
  },
  UpdateAttributeRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', example: 'email_address' },
      type: { type: 'string', example: 'VARCHAR(300)' },
      required: { type: 'boolean', example: true }
    }
  },
  AttributeListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        required: ['attributes', 'count'],
        properties: {
          attributes: {
            type: 'array',
            items: { $ref: '#/components/schemas/Attribute' }
          },
          count: { type: 'integer', example: 5 }
        }
      }
    }
  },
  AttributeTypes: {
    type: 'object',
    properties: {
      VARCHAR: { type: 'string', description: 'Variable character string (requires size)' },
      INT: { type: 'string', description: 'Integer number' },
      TEXT: { type: 'string', description: 'Long text content' },
      DATE: { type: 'string', description: 'Date only (YYYY-MM-DD)' },
      DATETIME: { type: 'string', description: 'Date and time (ISO 8601)' },
      BOOLEAN: { type: 'string', description: 'True/false value' },
      DECIMAL: { type: 'string', description: 'Decimal number (requires precision/scale)' }
    }
  }
};