import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { TenantAuthController } from '../controllers/TenantAuthController.js';
import { OAuthController } from '../controllers/OAuthController.js';
import { validate } from '../../../shared/middleware/validate.js';
import { authMiddleware } from '../../../shared/middleware/auth.middleware.js';
import { tenantAuthMiddleware } from '../../../shared/middleware/tenantAuth.middleware.js';
import { strictRateLimiter } from '../../../shared/middleware/ratelimiter.middleware.js';
import { registerSchema, loginSchema, logoutSchema, tenantRegisterSchema, tenantLoginSchema, revokeSessionSchema, refreshTokenSchema } from '../../../shared/validation/auth.js';

const router = express.Router();

// Console user routes
router.post('/register', strictRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', strictRateLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', strictRateLimiter, validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', authMiddleware, validate(logoutSchema), AuthController.logout);
router.get('/sessions', authMiddleware, AuthController.getSessions);
router.delete('/sessions/:sessionId', authMiddleware, validate(revokeSessionSchema), AuthController.revokeSession);

// Tenant user routes
router.post('/tenant/register', strictRateLimiter, validate(tenantRegisterSchema), TenantAuthController.register);
router.post('/tenant/login', strictRateLimiter, validate(tenantLoginSchema), TenantAuthController.login);
router.post('/tenant/logout', tenantAuthMiddleware, TenantAuthController.logout);
router.get('/tenant/sessions', tenantAuthMiddleware, TenantAuthController.getSessions);
router.delete('/tenant/sessions/:sessionId', tenantAuthMiddleware, validate(revokeSessionSchema), TenantAuthController.revokeSession);
router.get('/tenant/me', tenantAuthMiddleware, TenantAuthController.getCurrentUser);

// Google OAuth routes
router.get('/google', strictRateLimiter, OAuthController.redirectToGoogle);
router.get('/google/callback', strictRateLimiter, OAuthController.handleCallback);
router.post('/google/refresh/:identityId', strictRateLimiter, OAuthController.refreshAccessToken);
router.post('/google/revoke/:identityId', strictRateLimiter, OAuthController.revokeAccess);

export default router;