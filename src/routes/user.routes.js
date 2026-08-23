import express from 'express';
import { 
    userRegister, 
    userLogin, 
    userLogout, 
    getUserSessions, 
    revokeSession 
} from '../controllers/User.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, logoutSchema } from '../validation/auth.js';

const userrouter = express.Router();

// Public routes
userrouter.route('/register').post(validate(registerSchema), userRegister);
userrouter.route('/login').post(validate(loginSchema), userLogin);

// Protected routes (require authentication)
userrouter.route('/logout').post(authMiddleware, validate(logoutSchema), userLogout);
export default userrouter;