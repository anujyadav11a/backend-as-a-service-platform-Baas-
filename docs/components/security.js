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
    name: 'X-API-Key',
    description: 'Project API Key for tenant/document operations. Obtain from Project SDK details or API Keys tab.'
  },
  cookieAuth: {
    type: 'apiKey',
    in: 'cookie',
    name: 'accessToken',
    description: 'HTTP-only cookie set on login. Used for browser-based console sessions.'
  }
};