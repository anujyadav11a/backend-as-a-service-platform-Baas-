import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';

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
        const sessionToken = req.cookies?.sessionId;
        const userId = req.user?.id;

        const result = await AuthService.logout({ sessionToken, userId });

        const response = new ApiResponse(200, null, "User logged out successfully");
        return res
            .status(response.statuscode)
            .json(result(res));
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
}