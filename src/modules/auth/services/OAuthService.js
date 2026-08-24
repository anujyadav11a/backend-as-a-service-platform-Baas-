import axios from 'axios';
import { Identity } from '../models/Identity.js';
import { User } from '../models/User.js';
import { ConsoleSession } from '../models/ConsoleSession.js';
import crypto from 'crypto';
import { ApiError } from '../../../shared/utils/apierror.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { logger } from '../../../shared/utils/Logger.js';
import { ValidationHelper } from '../../../shared/utils/validate.js';
import { setAuthCookies } from '../../../shared/utils/cookieUtils.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';

export class OAuthService {
    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
        this.tokenEndpoint = 'https://oauth2.googleapis.com/token';
        this.userInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';
        this.authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    }

    generateAuthUrl() {
        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            logger.error('Missing Google OAuth configuration', {
                hasClientId: !!this.clientId,
                hasClientSecret: !!this.clientSecret,
                hasRedirectUri: !!this.redirectUri
            });
            throw ApiError.internal('OAuth configuration is incomplete');
        }

        const state = crypto.randomBytes(32).toString('hex');
        
        const scope = [
            'openid',
            'profile', 
            'email'
        ].join(' ');

        const authUrl = new URL(this.authEndpoint);
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('redirect_uri', this.redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', scope);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('access_type', 'offline');
        authUrl.searchParams.append('prompt', 'consent');

        logger.info('Generated OAuth URL successfully', { state });

        return {
            authUrl: authUrl.toString(),
            state: state,
            oauthState: state
        };
    }

    async handleCallback({ code, state, sessionOauthState, req }) {
        logger.info('Handling OAuth callback', { 
            hasCode: !!code, 
            hasState: !!state, 
            ip: req.ip 
        });
       
        if (!code) {
            throw ApiError.badRequest('Authorization code is required');
        }

        if (!state || !sessionOauthState || state !== sessionOauthState) {
            logger.error('CSRF validation failed', { 
                providedState: state, 
                sessionState: sessionOauthState 
            });
            throw ApiError.badRequest('Invalid state parameter - CSRF protection failed');
        }

        const tokenData = await this.exchangeCodeForTokens(code);
        const userInfo = await this.getUserInfo(tokenData.access_token);
        const result = await this.processOAuthUser(userInfo, tokenData, req);

        // Emit domain event
        eventBus.emit(AuthEvents.OAUTH_GOOGLE_CALLBACK, {
            userId: result.user.id,
            email: result.user.email,
            googleUserId: result.oauth.provider_id,
            isNewUser: result.oauth.connected_at ? false : true, // approximate
            isPrimaryIdentity: result.oauth.is_primary
        });

        logger.info('OAuth authentication successful', { 
            userId: result.user.id, 
            email: result.user.email 
        });

        return result;
    }

    async exchangeCodeForTokens(code) {
        logger.debug('Exchanging authorization code for tokens');

        try {
            const response = await axios.post(this.tokenEndpoint, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const tokenData = response.data;
            
            if (!tokenData.access_token) {
                logger.error('No access token received from Google', { tokenData });
                throw ApiError.badGateway('No access token received from Google');
            }

            logger.info('Successfully exchanged code for tokens', {
                hasAccessToken: !!tokenData.access_token,
                hasRefreshToken: !!tokenData.refresh_token,
                expiresIn: tokenData.expires_in
            });

            return {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expires_in,
                token_type: tokenData.token_type || 'Bearer',
                scope: tokenData.scope,
                id_token: tokenData.id_token
            };

        } catch (error) {
            if (error.response) {
                logger.error('Google token exchange failed', {
                    status: error.response.status,
                    data: error.response.data
                });
                throw ApiError.badGateway(
                    `Failed to exchange code for tokens: ${error.response.data?.error_description || error.response.data?.error || 'Unknown error'}`
                );
            }
            
            logger.error('Token exchange network error', { error: error.message });
            throw ApiError.serviceUnavailable('Failed to connect to Google OAuth service');
        }
    }

    async getUserInfo(accessToken) {
        logger.debug('Fetching user info from Google');

        try {
            const response = await axios.get(this.userInfoEndpoint, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const userInfo = response.data;
            
            if (!userInfo.id || !userInfo.email) {
                logger.error('Incomplete user info from Google', { userInfo });
                throw ApiError.badGateway('Incomplete user information received from Google');
            }

            ValidationHelper.validateEmail(userInfo.email);

            logger.info('Successfully retrieved user info', {
                userId: userInfo.id,
                email: userInfo.email,
                hasName: !!userInfo.name
            });

            return userInfo;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error.response?.status === 401) {
                logger.error('Invalid access token for user info', { status: error.response.status });
                throw ApiError.unauthorized('Invalid or expired access token');
            }

            logger.error('Failed to get user info from Google', {
                status: error.response?.status,
                message: error.message
            });
            throw ApiError.serviceUnavailable('Failed to retrieve user information from Google');
        }
    }

    async processOAuthUser(userInfo, tokenData, req) {
        const googleUserId = ValidationHelper.sanitizeInput(userInfo.id);
        const email = ValidationHelper.sanitizeInput(userInfo.email);
        const name = ValidationHelper.sanitizeInput(userInfo.name || email.split('@')[0]);
        const picture = userInfo.picture;

        logger.info('Processing OAuth user', { googleUserId, email, name: !!name });

        try {
            let identity = await Identity.findByProvider('google', googleUserId);
            let user;

            if (identity) {
                logger.info('Existing identity found, updating', { identityId: identity._id });
                
                await identity.updateTokenData({
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in,
                    scope: tokenData.scope?.split(' ')
                });

                identity.provider_email = email;
                identity.provider_name = name;
                if (picture) identity.provider_data.set('avatar', picture);
                await identity.save();

                user = await User.findById(identity.user_id);
                if (!user) {
                    logger.error('User not found for existing identity', { 
                        identityId: identity._id, 
                        userId: identity.user_id 
                    });
                    throw ApiError.internal('User account not found for existing OAuth identity');
                }
            } else {
                logger.info('New identity, checking for existing user', { email });
                
                user = await User.findOne({ email: email });

                if (!user) {
                    logger.info('Creating new user', { email, name });
                    
                    ValidationHelper.validateStringLength(name, 'name', 1, 100);
                    ValidationHelper.validateEmail(email);
                    
                    user = new User({
                        name: name,
                        email: email,
                        password: this.generateRandomPassword(),
                        role: 'user'
                    });
                    await user.save();
                    
                    logger.info('New user created', { userId: user._id, email });
                } else {
                    logger.info('Linking OAuth to existing user', { userId: user._id, email });
                }

                identity = new Identity({
                    user_id: user._id,
                    provider: 'google',
                    provider_id: googleUserId,
                    provider_email: email,
                    provider_name: name,
                    refresh_token: tokenData.refresh_token,
                    expires_at: tokenData.expires_in ? 
                        new Date(Date.now() + (tokenData.expires_in * 1000)) : null,
                    scope: tokenData.scope ? tokenData.scope.split(' ') : [],
                    is_active: true
                });

                if (picture) {
                    identity.provider_data.set('avatar', picture);
                }

                await identity.save();
                logger.info('New identity created', { identityId: identity._id });

                const userIdentities = await Identity.findByUser(user._id);
                if (userIdentities.length === 1) {
                    await Identity.setPrimaryIdentity(user._id, identity._id);
                    identity.is_primary = true;
                    logger.info('Set as primary identity', { identityId: identity._id });
                }
            }

            const session = await this.createSession(user, req);

            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshtoken = refreshToken;
            await user.save();

            logger.info('OAuth user processing completed', { 
                userId: user._id, 
                sessionId: session._id 
            });

            const tokens = {
                accessToken,
                refreshToken,
                sessionToken: session.session_token
            };

            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                tokens: {
                    accessToken,
                    refreshToken
                },
                session: {
                    id: session._id,
                    expires_at: session.expires_at
                },
                oauth: {
                    provider: 'google',
                    provider_id: googleUserId,
                    provider_email: email,
                    is_primary: identity.is_primary,
                    connected_at: identity.createdAt
                },
                cookies: setAuthCookies(null, tokens, 'console')
            };

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            logger.error('Failed to process OAuth user', {
                error: error.message,
                stack: error.stack,
                googleUserId,
                email
            });
            throw ApiError.internal(`Failed to process OAuth user: ${error.message}`);
        }
    }

    async createSession(user, req) {
        try {
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const refreshToken = crypto.randomBytes(32).toString('hex');

            const session = new ConsoleSession({
                user_id: user._id,
                session_token: sessionToken,
                refresh_token: refreshToken,
                ip_address: req.ip || req.connection.remoteAddress,
                user_agent: req.headers['user-agent'] || 'Unknown',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                login_method: 'oauth'
            });

            const savedSession = await session.save();
            logger.info('Session created successfully', { 
                sessionId: savedSession._id, 
                userId: user._id 
            });
            
            return savedSession;
        } catch (error) {
            logger.error('Failed to create session', {
                error: error.message,
                userId: user._id
            });
            throw ApiError.internal(`Failed to create session: ${error.message}`);
        }
    }

    generateRandomPassword() {
        return crypto.randomBytes(16).toString('hex');
    }

    async refreshAccessToken(identityId) {
        ValidationHelper.validateObjectId(identityId, 'Identity ID');

        logger.info('Refreshing access token', { identityId });

        const identity = await Identity.findById(identityId);
        if (!identity || !identity.isRefreshTokenValid()) {
            logger.error('Invalid or expired refresh token', { identityId });
            throw ApiError.badRequest('Invalid or expired refresh token');
        }

        try {
            const response = await axios.post(this.tokenEndpoint, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: identity.refresh_token,
                grant_type: 'refresh_token'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const tokenData = response.data;
            
            await identity.updateTokenData({
                refresh_token: tokenData.refresh_token || identity.refresh_token,
                expires_in: tokenData.expires_in,
                scope: tokenData.scope
            });

            logger.info('Access token refreshed successfully', { identityId });

            // Emit domain event
            eventBus.emit(AuthEvents.OAUTH_TOKEN_REFRESHED, {
                identityId,
                provider: 'google'
            });

            return {
                access_token: tokenData.access_token,
                expires_in: tokenData.expires_in,
                token_type: tokenData.token_type
            };

        } catch (error) {
            if (error.response) {
                logger.error('Google token refresh failed', {
                    identityId,
                    status: error.response.status,
                    data: error.response.data
                });
                throw ApiError.badGateway(`Failed to refresh access token: ${error.response.data?.error_description || 'Unknown error'}`);
            }
            
            logger.error('Token refresh network error', { identityId, error: error.message });
            throw ApiError.serviceUnavailable('Failed to connect to Google OAuth service');
        }
    }

    async revokeAccess(identityId) {
        ValidationHelper.validateObjectId(identityId, 'Identity ID');

        logger.info('Revoking OAuth access', { identityId });

        const identity = await Identity.findById(identityId);
        if (!identity) {
            logger.error('Identity not found for revocation', { identityId });
            throw ApiError.notFound('OAuth identity not found');
        }

        try {
            const tokenInfo = await this.refreshAccessToken(identityId);
            
            try {
                await axios.post('https://oauth2.googleapis.com/revoke', {
                    token: tokenInfo.access_token
                });
                logger.info('Successfully revoked token at Google', { identityId });
            } catch (revokeError) {
                logger.warn('Failed to revoke at Google (continuing with local revocation)', {
                    identityId,
                    error: revokeError.message
                });
            }

            await identity.revoke();
            logger.info('OAuth access revoked successfully', { identityId });

            // Emit domain event
            eventBus.emit(AuthEvents.OAUTH_REVOKED, {
                identityId,
                provider: 'google'
            });

            return { success: true };

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            logger.error('Failed to revoke OAuth access', {
                identityId,
                error: error.message
            });
            throw ApiError.internal(`Failed to revoke access: ${error.message}`);
        }
    }
}