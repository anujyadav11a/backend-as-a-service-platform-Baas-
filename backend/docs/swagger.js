import swaggerJSDoc from 'swagger-jsdoc';
import { securitySchemes } from './components/security.js';
import { responses } from './components/responses/index.js';
import { schemas } from './components/schemas/index.js';
import { parameters } from './components/parameters.js';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'BaaS Platform API',
      version: '1.0.0',
      description: 'Backend as a Service Platform - Complete API Reference',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      { url: 'http://localhost:8000', description: 'Development server' }
    ],
    components: {
      securitySchemes,
      responses,
      schemas,
      parameters
    },
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] },
      { cookieAuth: [] }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication & Authorization endpoints' },
      { name: 'Projects', description: 'Project management endpoints' },
      { name: 'Databases', description: 'Database management endpoints' },
      { name: 'Collections', description: 'Collection management endpoints' },
      { name: 'Attributes', description: 'Attribute/Column management endpoints' },
      { name: 'Documents', description: 'Document CRUD & Query operations' },
      { name: 'Health', description: 'Health check endpoints' }
    ]
  },
  apis: [
    './src/modules/**/*.docs.js',
    './src/routes/*.docs.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;