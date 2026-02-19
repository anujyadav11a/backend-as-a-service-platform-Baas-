import axios from 'axios';
import { Identity } from '../models/Auth/console/identity.model.js';
import { User } from '../models/Auth/console/user.model.js';
import { ConsoleSession } from '../models/Auth/console/consoleSession.js';
import crypto from 'crypto';

export class GoogleOAuthController {
    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
        this.tokenEndpoint = 'https://oauth2.googleapis.com/token';
        this.userInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';
        this.authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    }

    /**
     * Generate Google OAuth authorization URL and redirect
     */
    async redirectToGoogle(req, res) {
        try {
            // Generate state parameter for CSRF protection
            const state = crypto.randomBytes(32).toString('hex');
            
            // Store state in session or temporary storage (you might want to use Redis)
            req.session = req.session || {};
            req.session.oauthState = state;

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
            authUrl.searchParams.append('access_type', 'offline'); // To get refresh token
            authUrl.searchParams.append('prompt', 'consent'); // Force consent to get refresh token

            res.status(200).json({
                success: true,
                message: 'Redirect to Google OAuth',
                data: {
                    authUrl: authUrl.toString(),
                    state: state
                }
            });

        } catch (error) {
            console.error('Google OAuth redirect error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate OAuth URL',
                error: error.message
            });
        }
    }

    /**
     * Handle Google OAuth callback
     */
    async handleCallback(req, res) {
        try {
            const { code, state, error } = req.query;

            // Check for OAuth errors
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'OAuth authorization failed',
                    error: error
                });
            }

            // Validate required parameters
            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: 'Authorization code is required'
                });
            }

            // Validate state parameter (CSRF protection)
            if (!state || !req.session?.oauthState || state !== req.session.oauthState) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid state parameter'
                });
            }

            // Clear the state from session
            delete req.session.oauthState;

            // Exchange code for tokens
            const tokenData = await this.exchangeCodeForTokens(code);
            
            // Get user info from Google
            const userInfo = await this.getUserInfo(tokenData.access_token);

            // Process the OAuth authentication
            const result = await this.processOAuthUser(userInfo, tokenData, req);

            res.status(200).json({
                success: true,
                message: 'Google OAuth authentication successful',
                data: result
            });

        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.status(500).json({
                success: false,
                message: 'OAuth authentication failed',
                error: error.message
            });
        }
    }

    /**
     * Exchange authorization code for access and refresh tokens
     */
    async exchangeCodeForTokens(code) {
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
                throw new Error('No access token received from Google');
            }

            return {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expires_in,
                token_type: tokenData.token_type || 'Bearer',
                scope: tokenData.scope,
                id_token: tokenData.id_token
            };

        } catch (error) {
            console.error('Token exchange error:', error.response?.data || error.message);
            throw new Error(`Failed to exchange code for tokens: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Get user information from Google
     */
    async getUserInfo(accessToken) {
        try {
            const response = await axios.get(this.userInfoEndpoint, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Get user info error:', error.response?.data || error.message);
            throw new Error(`Failed to get user info: ${error.message}`);
        }
    }

    /**
     * Process OAuth user - create/update user and identity
     */
    async processOAuthUser(userInfo, tokenData, req) {
        try {
            const googleUserId = userInfo.id;
            const email = userInfo.email;
            const name = userInfo.name;
            const picture = userInfo.picture;

            // Check if identity already exists
            let identity = await Identity.findByProvider('google', googleUserId);
            let user;

            if (identity) {
                // Update existing identity
                await identity.updateTokenData({
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in,
                    scope: tokenData.scope?.split(' ')
                });

                // Update provider info
                identity.provider_email = email;
                identity.provider_name = name;
                if (picture) identity.provider_data.set('avatar', picture);
                await identity.save();

                // Get associated user
                user = await User.findById(identity.user_id);
            } else {
                // Check if user exists with same email
                user = await User.findOne({ email: email });

                if (!user) {
                    // Create new user
                    user = new User({
                        name: name,
                        email: email,
                        password: this.generateRandomPassword(),
                        role: 'user'
                    });
                    await user.save();
                }

                // Create new identity
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

                // Set as primary if it's the user's first OAuth identity
                const userIdentities = await Identity.findByUser(user._id);
                if (userIdentities.length === 1) {
                    await Identity.setPrimaryIdentity(user._id, identity._id);
                    identity.is_primary = true;
                }
            }

            // Create session
            const session = await this.createSession(user, req);

            // Generate JWT tokens
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // Update user refresh token
            user.refreshtoken = refreshToken;
            await user.save();

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
                }
            };

        } catch (error) {
            console.error('Process OAuth user error:', error);
            throw new Error(`Failed to process OAuth user: ${error.message}`);
        }
    }

    /**
     * Create user session
     */
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
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                login_method: 'oauth'
            });

            return session.save();
        } catch (error) {
            console.error('Create session error:', error);
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }

    /**
     * Generate random password for OAuth users
     */
    generateRandomPassword() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Refresh Google access token using refresh token
     */
    async refreshAccessToken(identityId) {
        try {
            const identity = await Identity.findById(identityId);
            if (!identity || !identity.isRefreshTokenValid()) {
                throw new Error('Invalid or expired refresh token');
            }

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
            
            // Update identity with new token data
            await identity.updateTokenData({
                refresh_token: tokenData.refresh_token || identity.refresh_token, // Google might not return new refresh token
                expires_in: tokenData.expires_in,
                scope: tokenData.scope
            });

            return {
                access_token: tokenData.access_token,
                expires_in: tokenData.expires_in,
                token_type: tokenData.token_type
            };

        } catch (error) {
            console.error('Refresh token error:', error.response?.data || error.message);
            throw new Error(`Failed to refresh access token: ${error.message}`);
        }
    }

    /**
     * Revoke Google OAuth access
     */
    async revokeAccess(identityId) {
        try {
            const identity = await Identity.findById(identityId);
            if (!identity) {
                throw new Error('Identity not found');
            }

            // Get current access token
            const tokenInfo = await this.refreshAccessToken(identityId);
            
            // Revoke at Google
            try {
                await axios.post('https://oauth2.googleapis.com/revoke', {
                    token: tokenInfo.access_token
                });
            } catch (revokeError) {
                console.warn('Failed to revoke at Google:', revokeError.message);
            }

            // Revoke locally
            await identity.revoke();
            
            return true;
        } catch (error) {
            console.error('Revoke access error:', error);
            throw new Error(`Failed to revoke access: ${error.message}`);
        }
    }
}

export const googleOAuthController = new GoogleOAuthController();