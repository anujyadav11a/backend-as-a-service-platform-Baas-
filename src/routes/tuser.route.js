import Router from 'express'
import{
     tenantRegister,
    tenantLogin,
    tenantLogout,
    getTenantSessions,
    revokeTenantSession,
    getCurrentTenantUser
} from "../controllers/tenant.controller.js"
import { authMiddleware } from '../middleware/auth.middleware.js'

const tenantUserroute =new Router()

tenantUserroute.route("/tenantRegister").post(tenantRegister)
tenantUserroute.route("/tenantlogin").post(tenantLogin)
tenantUserroute.route("/tenantlogout").post(tenantLogout)
tenantUserroute.route("/getTenantsessions").get(getTenantSessions)


export  default tenantUserroute