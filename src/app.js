import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import googleOAuthRoutes from './routes/googleOAuth.routes.js';
import { sessionMiddleware } from './middleware/session.middleware.js';
import { testOAuth } from './controllers/test.controller.js';
import { logger } from './utils/Logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';

const app = express();

const Options={
    origin:process.env.CORS_ORIGIN,
    Credential:true
}

// Request logging middleware
app.use(logger.logRequest.bind(logger));

app.use(cors(Options))
app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({limit:"10kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(sessionMiddleware)

// Test route
app.get('/test-oauth', testOAuth);

// OAuth routes
app.use('/auth', googleOAuthRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app