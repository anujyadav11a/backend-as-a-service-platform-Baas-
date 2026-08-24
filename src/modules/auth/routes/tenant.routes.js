import express from 'express';
import { TenantAuthController } from '../controllers/TenantAuthController.js';
import { tenantAuthMiddleware } from '../../../middleware/tenantAuth.middleware.js';
import { validate } from '../../../shared/middleware/validate.js';
import { tenantRegisterSchema, tenantLoginSchema, revokeSessionSchema } from '../../../shared/validation/auth.js';

const router = express.Router();

// Tenant user routes (mounted at /api/v1/tenantuser)
router.post('/tenantRegister', validate(tenantRegisterSchema), TenantAuthController.register);
router.post('/tenantlogin', validate(tenantLoginSchema), TenantAuthController.login);
router.post('/tenantlogout', tenantAuthMiddleware, TenantAuthController.logout);
router.get('/getTenantsessions', tenantAuthMiddleware, TenantAuthController.getSessions);
router.delete('/revokeSession/:sessionId', tenantAuthMiddleware, validate(revokeSessionSchema), TenantAuthController.revokeSession);
router.get('/getCurrentUser', tenantAuthMiddleware, TenantAuthController.getCurrentUser);

export default router;