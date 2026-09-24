export const attributeSchemas = {
  Attribute: {
    type: 'object',
    required: ['attribute_id', 'name', 'type', 'collectionId', 'createdAt', 'updatedAt'],
    properties: {
      attribute_id: { type: 'string', example: 'attr_abc123' },
      name: { type: 'string', example: 'email' },
      type: { type: 'string', enum: ['VARCHAR', 'INT', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN', 'DECIMAL'], example: 'VARCHAR' },
      size: { type: 'integer', nullable: true, example: 255 },
      required: { type: 'boolean', example: true },
      unique: { type: 'boolean', example: true },
      defaultValue: { type: ['string', 'number', 'boolean'], nullable: true, example: null },
      collectionId: { type: 'string', example: 'col_abc123' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateAttributeRequest: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-zA-Z][a-zA-Z0-9_]*$', example: 'email' },
      type: { type: 'string', enum: ['VARCHAR', 'INT', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN', 'DECIMAL'], example: 'VARCHAR' },
      size: { type: 'integer', minimum: 1, maximum: 65535, nullable: true, example: 255 },
      required: { type: 'boolean', default: false, example: true },
      unique: { type: 'boolean', default: false, example: true },
      defaultValue: { type: ['string', 'number', 'boolean'], nullable: true, example: null }
    }
  },
  UpdateAttributeRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-zA-Z][a-zA-Z0-9_]*$', example: 'email_address' },
      type: { type: 'string', enum: ['VARCHAR', 'INT', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN', 'DECIMAL'], example: 'VARCHAR' },
      size: { type: 'integer', minimum: 1, maximum: 65535, nullable: true, example: 300 },
      required: { type: 'boolean', example: true },
      unique: { type: 'boolean', example: true },
      defaultValue: { type: ['string', 'number', 'boolean'], nullable: true, example: null }
    }
  },
  AttributeListResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Attribute' }
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