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

const tenantUserroute = new Router()

// Public routes (no authentication required)
tenantUserroute.route("/tenantRegister").post(tenantRegister)
tenantUserroute.route("/tenantlogin").post(tenantLogin)

// Protected routes (authentication required)
tenantUserroute.route("/tenantlogout").post(tenantAuthMiddleware, tenantLogout)
tenantUserroute.route("/getTenantsessions").get(tenantAuthMiddleware, getTenantSessions)
tenantUserroute.route("/revokeSession/:sessionId").delete(tenantAuthMiddleware, revokeTenantSession)
tenantUserroute.route("/getCurrentUser").get(tenantAuthMiddleware,cacheMiddleware("currentUser",), getCurrentTenantUser)

export default tenantUserroute