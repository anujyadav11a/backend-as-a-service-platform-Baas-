export const successResponse = {
  SuccessResponse: {
    type: 'object',
    required: ['success', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' }
    }
  }
};

export const errorResponse = {
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
  }
};

export const paginationResponse = {
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

export const responses = {
  ...successResponse,
  ...errorResponse,
  ...paginationResponse
};