import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import googleOAuthRoutes from './modules/auth/routes/googleOAuth.routes.js';
import userRoutes from './modules/auth/routes/user.routes.js';
import tenantUserroute from './modules/auth/routes/tenant.routes.js';
import projectRoutes from './modules/project/routes/project.routes.js';
import databaseRouter from './modules/baas/routes/database.routes.js';
import collectionRouter from './modules/baas/routes/collection.routes.js';
import attributeRouter from './modules/baas/routes/attribute.routes.js';
import healthRoutes from './routes/health.routes.js';

import { logger } from './shared/utils/Logger.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.middleware.js';
import { refreshTokenMiddleware } from './shared/middleware/auth.middleware.js';
import { tenantRefreshTokenMiddleware } from './middleware/tenantAuth.middleware.js';
import { sessionMiddleware } from './middleware/googleauthsession.middleware.js';

import config from './shared/config/env.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';


   
const specPath = path.join(process.cwd(), 'docs', 'openapi.json');
const swaggerDocument = JSON.parse(fs.readFileSync(specPath, 'utf8'));



const corsOptions = {
    origin: 'http://16.4.19.207:5173',

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'project-id', 'api-key'],
};

const app = express();

// Request logging middleware
app.use(logger.logRequest.bind(logger));

app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: { persistAuthorization: true }
}));

// Session middleware for OAuth state management
app.use(sessionMiddleware);

// Auto-refresh tokens for both console and tenant users
app.use(refreshTokenMiddleware);
app.use(tenantRefreshTokenMiddleware);

// Routes
app.use('/', healthRoutes);
app.use('/auth', googleOAuthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tenantuser', tenantUserroute);
// BAAS routes with project-level authorization (routes include /projects/ prefix)
app.use('/api/v1', databaseRouter);
app.use('/api/v1', collectionRouter);
app.use('/api/v1', attributeRouter);
// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;