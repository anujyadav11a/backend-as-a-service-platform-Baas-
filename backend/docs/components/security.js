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
  consoleCookieAuth: {
    type: 'apiKey',
    in: 'cookie',
    name: 'AccessToken',
    description: 'HTTP-only cookie set on console login. Used for browser-based console sessions.'
  },
  tenantCookieAuth: {
    type: 'apiKey',
    in: 'cookie',
    name: 'tenantAccessToken',
    description: 'HTTP-only cookie set on tenant login. Used for browser-based tenant sessions.'
  },
  projectIdHeader: {
    type: 'apiKey',
    in: 'header',
    name: 'project-id',
    description: 'Project ID for tenant registration/login operations. Obtain from Project SDK details.'
  }
};
