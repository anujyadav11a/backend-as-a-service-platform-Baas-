import Router from 'express'
import{
     tenantRegister,
    tenantLogin,
    tenantLogout,
    getTenantSessions,
    revokeTenantSession,
    getCurrentTenantUser
} from "../controllers/tenant.controller.js"
import { tenantAuthMiddleware } from '../middleware/tenantAuth.middleware.js'
import { cacheMiddleware } from '../middleware/redisCache.js'
import { validate } from '../middleware/validate.js'
import { tenantRegisterSchema, tenantLoginSchema, revokeSessionSchema } from '../validation/auth.js'

const tenantUserroute = new Router()

// Public routes (no authentication required)
tenantUserroute.route("/tenantRegister").post(validate(tenantRegisterSchema), tenantRegister)
tenantUserroute.route("/tenantlogin").post(validate(tenantLoginSchema), tenantLogin)

// Protected routes (authentication required)
tenantUserroute.route("/tenantlogout").post(tenantAuthMiddleware, tenantLogout)
tenantUserroute.route("/getTenantsessions").get(tenantAuthMiddleware, getTenantSessions)
tenantUserroute.route("/revokeSession/:sessionId").delete(tenantAuthMiddleware, validate(revokeSessionSchema), revokeTenantSession)
tenantUserroute.route("/getCurrentUser").get(tenantAuthMiddleware, cacheMiddleware("currentUser",), getCurrentTenantUser)

export default tenantUserroute