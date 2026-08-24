import { OAuthService } from '../services/OAuthService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { setOAuthState, consumeOAuthState } from '../../../middleware/googleauthsession.middleware.js';

export class OAuthController {
    static async redirectToGoogle(req, res) {
        const oauthService = new OAuthService();
        const { authUrl, state } = oauthService.generateAuthUrl();

        await setOAuthState(state, { createdAt: Date.now() });

        const response = new ApiResponse(
            200,
            { authUrl, state },
            'OAuth URL generated successfully'
        );

        return res.status(response.statuscode).json(response);
    }

    static async handleCallback(req, res) {
        const { code, state, error } = req.query;
        const sessionOauthState = await consumeOAuthState(state);

        const oauthService = new OAuthService();
        const result = await oauthService.handleCallback({ 
            code, 
            state, 
            sessionOauthState: !!sessionOauthState,
            req 
        });

        const response = new ApiResponse(
            200,
            {
                user: result.user,
                tokens: result.tokens,
                session: result.session,
                oauth: result.oauth
            },
            'Google OAuth authentication successful'
        );

        return res
            .status(response.statuscode)
            .json(result.cookies(res, result));
    }

    static async refreshAccessToken(req, res) {
        const { identityId } = req.params;
        const oauthService = new OAuthService();
        const result = await oauthService.refreshAccessToken(identityId);

        const response = new ApiResponse(
            200,
            result,
            'Access token refreshed successfully'
        );

        return res.status(response.statuscode).json(response);
    }

    static async revokeAccess(req, res) {
        const { identityId } = req.params;
        const oauthService = new OAuthService();
        await oauthService.revokeAccess(identityId);

        const response = new ApiResponse(200, null, 'OAuth access revoked successfully');
        return res.status(response.statuscode).json(response);
    }
}