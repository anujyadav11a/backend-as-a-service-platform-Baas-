import swaggerJSDoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import the options using dynamic import since they're ES modules
const { securitySchemes } = await import('./components/security.js');

const { schemas } = await import('./components/schemas/index.js');
const { parameters } = await import('./components/parameters.js');

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

const spec = swaggerJSDoc(options);

const outputPath = join(__dirname, 'openapi.json');
writeFileSync(outputPath, JSON.stringify(spec, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);