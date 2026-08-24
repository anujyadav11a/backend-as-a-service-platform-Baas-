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

const app = express();

const Options={
    origin:process.env.CORS_ORIGIN,
    credentials:true,
    allowedHeaders:"*"
}

// Request logging middleware
app.use(logger.logRequest.bind(logger));

app.use(cors(Options))
app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({limit:"10kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Session middleware for OAuth state management
app.use(sessionMiddleware)

// Auto-refresh tokens for both console and tenant users
app.use(refreshTokenMiddleware)
app.use(tenantRefreshTokenMiddleware)

// Routes
app.use('/', healthRoutes);
app.use('/auth', googleOAuthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tenantuser', tenantUserroute)
app.use('/api/v1/database',databaseRouter);
app.use('/api/v1/collection', collectionRouter);
app.use('/api/v1/attributes', attributeRouter);
// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app