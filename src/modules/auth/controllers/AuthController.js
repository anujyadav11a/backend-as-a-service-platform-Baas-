import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import * as cookieUtils from '../../../shared/utils/cookieUtils.js';
import { logger } from '../../../shared/utils/Logger.js';
  
console.log('cookieUtils keys:', Object.keys(cookieUtils));

export class AuthController {
    static async register(req, res) {
        const { name, email, password } = req.body;
        const user = await AuthService.register({ name, email, password });

        const response = new ApiResponse(201, user, "User registered successfully");
        return res.status(response.statuscode).json(response);
    }

    static async login(req, res) {
        const { email, password } = req.body;
        const result = await AuthService.login({ email, password, req });

        cookieUtils.setAuthCookies(res, {
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            sessionToken: result.tokens.sessionToken
        }, 'console');

        const response = new ApiResponse(
            200,
            {
                user: result.user,
                session: result.session,
                tokens: result.tokens
            },
            "User logged in successfully"
        );

        return res.status(response.statuscode).json(response);
    }

    static async refreshToken(req, res) {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        
        if (!refreshToken) {
            const response = new ApiResponse(400, null, "Refresh token is required");
            return res.status(response.statuscode).json(response);
        }

        const result = await AuthService.refreshToken(refreshToken, req);

        cookieUtils.setAuthCookies(res, {
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            sessionToken: result.tokens.sessionToken    
        }, 'console');

        const response = new ApiResponse(
            200,
            {
                tokens: result.tokens
            },
            "Token refreshed successfully"
        );

        return res.status(response.statuscode).json(response);
    }

    

    static async getSessions(req, res) {
        const userId = req.user?.id;
        const sessions = await AuthService.getSessions(userId);

        const response = new ApiResponse(200, sessions, "Sessions retrieved successfully");
        return res.status(response.statuscode).json(response);
    }

    static async revokeSession(req, res) {
        const { sessionId } = req.params;
        const userId = req.user?.id;

        await AuthService.revokeSession(sessionId, userId);

        const response = new ApiResponse(200, null, "Session revoked successfully");
        return res.status(response.statuscode).json(response);
    }

    static async logout(req, res) {
       
        try {
            const refreshToken = req.cookies?.RefreshToken;
            const userId = req.user?.id || req.user?._id;
            console.log('>>> userId:', userId, 'hasRefreshToken:', !!refreshToken);

            await AuthService.logout({ refreshToken, userId });
            
            cookieUtils.clearAuthCookies(res, 'console');

            logger.info('Console user logged out', { userId });

            const response = new ApiResponse(200, null, "Logged out successfully");
            console.log('>>> LOGOUT HANDLER SUCCESS');
            return res.status(response.statuscode).json(response);
        } catch (err) {
            console.error('>>> LOGOUT HANDLER ERROR:', err.message);
            console.error('>>> Stack:', err.stack);
            throw err;
        }
    }
}