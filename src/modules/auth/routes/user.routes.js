import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validate } from '../../../shared/middleware/validate.js';
import { authMiddleware } from '../../../shared/middleware/auth.middleware.js';
import { registerSchema, loginSchema, logoutSchema, revokeSessionSchema } from '../../../shared/validation/auth.js';

const router = express.Router();

// Console user routes (mounted at /api/v1/users)
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', authMiddleware, validate(logoutSchema), AuthController.logout);
router.get('/sessions', authMiddleware, AuthController.getSessions);
router.delete('/sessions/:sessionId', authMiddleware, validate(revokeSessionSchema), AuthController.revokeSession);

export default router;