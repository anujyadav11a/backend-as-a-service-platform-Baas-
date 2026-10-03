import { OAuthService } from '../services/OAuthService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { setOAuthState, consumeOAuthState, getOAuthState } from '../../../middleware/googleauthsession.middleware.js';
import { setAuthCookies } from '../../../shared/utils/cookieUtils.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { RedisSessionStore } from '../../../shared/utils/redisSessionStore.js';

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

        // FIRST: Try to consume state (atomic operation - only ONE request succeeds)
        const sessionOauthState = await consumeOAuthState(state);

        logger.info('OAuth state consumed', { 
            state, 
            found: !!sessionOauthState 
        });

        // If state was consumed successfully, THIS request owns the callback
        if (sessionOauthState) {
            // Check if code already processed (in case of retry after successful processing)
            const existingSession = await RedisSessionStore.getProcessedCode(code);
            if (existingSession) {
                logger.info('Duplicate OAuth code - returning existing session', { code });
                const response = new ApiResponse(
                    200,
                    existingSession,
                    'OAuth authentication successful (cached)'
                );
                setAuthCookies(res, existingSession.tokens, 'console');
                return res.status(response.statuscode).json(response);
            }

            // Process OAuth flow
            const oauthService = new OAuthService();
            const result = await oauthService.handleCallback({ 
                code, 
                state, 
                sessionOauthState: true,
                req 
            });

            // Cache the successful result for duplicate callbacks
            await RedisSessionStore.markCodeProcessed(code, {
                user: result.user,
                tokens: result.tokens,
                session: result.session,
                oauth: result.oauth
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

        // State NOT consumed (already consumed by another request)
        // Wait for that request to cache the result, then return it
        logger.info('State already consumed by another request - waiting for code cache', { code });
        
        // Poll for cached result (max 10 seconds)
        for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const existingSession = await RedisSessionStore.getProcessedCode(code);
            if (existingSession) {
                logger.info('Found cached session from concurrent request', { code });
                const response = new ApiResponse(
                    200,
                    existingSession,
                    'OAuth authentication successful (cached from concurrent request)'
                );
                setAuthCookies(res, existingSession.tokens, 'console');
                return res.status(response.statuscode).json(response);
            }
        }

        // Fallback: state gone but no cache yet (shouldn't happen)
        const existing = await getOAuthState(state);
        logger.error('CSRF validation failed - no cached result', { 
            providedState: state, 
            hasSessionState: false,
            stateStillExists: !!existing
        });
        throw ApiError.badRequest('Invalid state parameter - CSRF protection failed. Please try logging in again.');
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