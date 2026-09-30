import { OAuthService } from '../services/OAuthService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { setOAuthState, consumeOAuthState, getOAuthState } from '../../../middleware/googleauthsession.middleware.js';
import { setAuthCookies } from '../../../shared/utils/cookieUtils.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';

export class OAuthController {
    static async redirectToGoogle(req, res) {
        const oauthService = new OAuthService();
        const { authUrl, state } = oauthService.generateAuthUrl();

        const stored = await setOAuthState(state, { createdAt: Date.now() });
        if (!stored) {
            logger.error('Failed to store OAuth state in Redis', { state });
            throw ApiError.internal('Failed to initialize OAuth flow');
        }

        const verified = await getOAuthState(state);
        if (!verified) {
            logger.error('OAuth state verification failed after storage', { state });
            throw ApiError.internal('Failed to verify OAuth state storage');
        }

        logger.info('OAuth state stored and verified', { state });

        const response = new ApiResponse(
            200,
            { authUrl, state },
            'OAuth URL generated successfully'
        );

        return res.status(response.statuscode).json(response);
    }

    static async handleCallback(req, res) {
        const { code, state, error } = req.query;

        logger.info('OAuth callback received', { 
            hasCode: !!code, 
            hasState: !!state, 
            hasError: !!error,
            state: state 
        });

        if (error) {
            logger.error('OAuth error from Google', { error });
            throw ApiError.badRequest(`OAuth error: ${error}`);
        }

        const sessionOauthState = await consumeOAuthState(state);

        logger.info('OAuth state consumed', { 
            state, 
            found: !!sessionOauthState 
        });

        if (!sessionOauthState) {
            const existing = await getOAuthState(state);
            logger.error('CSRF validation failed', { 
                providedState: state, 
                hasSessionState: false,
                stateStillExists: !!existing
            });
            throw ApiError.badRequest('Invalid state parameter - CSRF protection failed. Please try logging in again.');
        }

        const oauthService = new OAuthService();
        const result = await oauthService.handleCallback({ 
            code, 
            state, 
            sessionOauthState: true,
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

        setAuthCookies(res, result.tokens, 'console');
        return res.status(response.statuscode).json(response);
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