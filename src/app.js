import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import googleOAuthRoutes from './routes/googleOAuth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import tenantUserroute from './routes/tuser.route.js';
import databaseRouter from './routes/database.route/database.route.js';
import collectionRouter from './routes/database.route/collection.route.js';
import attributeRouter from './routes/database.route/attribute.route.js';

import { logger } from './utils/Logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import { refreshTokenMiddleware } from './middleware/auth.middleware.js';
import { tenantRefreshTokenMiddleware } from './middleware/tenantAuth.middleware.js';

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

// Auto-refresh tokens for both console and tenant users
app.use(refreshTokenMiddleware)
app.use(tenantRefreshTokenMiddleware)

// Routes
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