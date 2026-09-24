export const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Console user JWT token. Obtain via `/api/v1/users/login` or `/api/v1/tenantuser/tenantlogin`'
  },
  apiKeyAuth: {
    type: 'apiKey',
    in: 'header',
    name: 'api-key',
    description: 'Project API Key for tenant/document operations. Obtain from Project SDK details or API Keys tab.'
  },
  cookieAuth: {
    type: 'apiKey',
    in: 'cookie',
    name: 'accessToken',
    description: 'HTTP-only cookie set on login. Used for browser-based console sessions.'
  },
  projectId:{
    type: 'project-id',
    in: 'header',
    name: 'project-id',
    description: 'Project ID for tenant/document operations. Obtain from Project SDK details or API Keys tab.'
  }
};
