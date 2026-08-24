import { TenantAuthService } from '../services/TenantAuthService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';

export class TenantAuthController {
    static async register(req, res) {
        const { username, email, password } = req.body;
        const projectId = req.headers['project-id'] || req.headers['x-frontier-project-id'];
        const apiKey = req.headers['api-key'] || req.headers['x-frontier-api-key'];

        const user = await TenantAuthService.register({ 
            username, 
            email, 
            password, 
            projectId, 
            apiKey 
        });

        const response = new ApiResponse(201, user, "User registered successfully");
        return res.status(response.statuscode).json(response);
    }

    static async login(req, res) {
        const { email, password } = req.body;
        const projectId = req.headers['project-id'] || req.headers['x-frontier-project-id'];
        const apiKey = req.headers['api-key'] || req.headers['x-frontier-api-key'];

        const result = await TenantAuthService.login({ 
            email, 
            password, 
            projectId, 
            apiKey,
            req 
        });

        const response = new ApiResponse(
            200,
            {
                user: result.user,
                session: result.session,
                tokens: result.tokens
            },
            "User logged in successfully"
        );

        return res
            .status(response.statuscode)
            .json(result.cookies(res, result));
    }

    static async logout(req, res) {
        const refreshToken = req.cookies?.tenantRefreshToken;
        const userId = req.user?.id || req.user?._id;

        const result = await TenantAuthService.logout({ refreshToken, userId });

        const response = new ApiResponse(200, null, "User logged out successfully");
        return res
            .status(response.statuscode)
            .json(result(res));
    }

    static async getSessions(req, res) {
        const userId = req.user?.id || req.user?._id;
        const projectId = req.user?.project_id;
        const sessions = await TenantAuthService.getSessions(userId, projectId);

        const response = new ApiResponse(200, sessions, "Sessions retrieved successfully");
        return res.status(response.statuscode).json(response);
    }

    static async revokeSession(req, res) {
        const { sessionId } = req.params;
        const userId = req.user?.id || req.user?._id;

        await TenantAuthService.revokeSession(sessionId, userId);

        const response = new ApiResponse(200, null, "Session revoked successfully");
        return res.status(response.statuscode).json(response);
    }

    static async getCurrentUser(req, res) {
        const userId = req.user?.id || req.user?._id;
        const user = await TenantAuthService.getCurrentUser(userId);

        const response = new ApiResponse(200, user, "Current user retrieved successfully");
        return res.status(response.statuscode).json(response);
    }
}