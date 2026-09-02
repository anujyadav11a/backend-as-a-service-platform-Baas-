export const parameters = {
  projectIdParam: {
    name: 'projectId',
    in: 'path',
    description: 'Project ID (e.g., proj_abc123)',
    required: true,
    schema: { type: 'string', pattern: '^proj_[a-zA-Z0-9]+$' }
  },
  projectSlugParam: {
    name: 'slug',
    in: 'path',
    description: 'Project slug/identifier',
    required: true,
    schema: { type: 'string' }
  },
  databaseIdParam: {
    name: 'database_id',
    in: 'path',
    description: 'Database ID',
    required: true,
    schema: { type: 'string' }
  },
  collectionIdParam: {
    name: 'collection_id',
    in: 'path',
    description: 'Collection ID',
    required: true,
    schema: { type: 'string' }
  },
  attributeIdParam: {
    name: 'attribute_id',
    in: 'path',
    description: 'Attribute/Column ID',
    required: true,
    schema: { type: 'string' }
  },
  documentIdParam: {
    name: 'document_id',
    in: 'path',
    description: 'Document ID',
    required: true,
    schema: { type: 'string' }
  },
  sessionIdParam: {
    name: 'sessionId',
    in: 'path',
    description: 'Session ID to revoke',
    required: true,
    schema: { type: 'string' }
  },
  identityIdParam: {
    name: 'identityId',
    in: 'path',
    description: 'OAuth Identity ID',
    required: true,
    schema: { type: 'string' }
  },
  pageQuery: {
    name: 'page',
    in: 'query',
    description: 'Page number (starts at 1)',
    required: false,
    schema: { type: 'integer', minimum: 1, default: 1 }
  },
  limitQuery: {
    name: 'limit',
    in: 'query',
    description: 'Items per page (max 100)',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
  },
  searchQuery: {
    name: 'q',
    in: 'query',
    description: 'Search term',
    required: false,
    schema: { type: 'string' }
  },
  keyIdParam: {
    name: 'keyId',
    in: 'path',
    description: 'API Key ID to revoke',
    required: true,
    schema: { type: 'string' }
  }
};