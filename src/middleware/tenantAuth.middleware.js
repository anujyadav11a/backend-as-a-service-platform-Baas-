import jwt from 'jsonwebtoken';
import { TenantUser } from '../modules/auth/models/TenantUser.js';
import { TenantSession } from '../modules/auth/models/TenantSession.js';
import { ApiError } from '../shared/utils/apierror.js';
import { logger } from '../shared/utils/Logger.js';
import { asyncHandler } from '../shared/utils/asynchandler.js';
import { COOKIE_NAMES, accessTokenCookieOptions } from '../shared/utils/cookieUtils.js';
import config from '../shared/config/env.js';

const { access: TENANT_ACCESS_COOKIE, refresh: TENANT_REFRESH_COOKIE, session: TENANT_SESSION_COOKIE } = COOKIE_NAMES.tenant;

/**
 * Middleware to authenticate tenant users
 */
export const tenantAuthMiddleware = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.[TENANT_ACCESS_COOKIE] || 
                      req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw ApiError.unauthorized("Access token is required");
        }

        // Verify JWT token
        const decodedToken = jwt.verify(token, config.jwt.accessTokenSecret);
        
        // Find tenant user
        const user = await TenantUser.findById(decodedToken._id).select("-password");
        if (!user) {
            logger.warn('Token valid but tenant user not found', { userId: decodedToken._id });
            throw ApiError.unauthorized("Invalid access token");
        }

        // Verify session is still active
        const sessionId = req.cookies?.[TENANT_SESSION_COOKIE];
        if (sessionId) {
            const session = await TenantSession.findOne({
                _id: sessionId,
                user_id: user._id,
                status: 'active'
            });

            if (!session || session.isExpired()) {
                logger.warn('Tenant session expired or invalid', { 
                    userId: user._id, 
                    sessionId: sessionId?.substring(0, 8) + '...' 
                });
                throw ApiError.unauthorized("Session expired");
            }

            // Update last activity
            session.last_activity = new Date();
            await session.save();
            req.session = session;
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            logger.warn('Invalid JWT token for tenant', { error: error.message });
            throw ApiError.unauthorized("Invalid access token");
        }
        
        if (error.name === 'TokenExpiredError') {
            logger.warn('JWT token expired for tenant', { error: error.message });
            throw ApiError.unauthorized("Access token expired");
        }

        if (error instanceof ApiError) {
            throw error;
        }

        logger.error('Tenant authentication middleware error', { error: error.message });
        throw ApiError.internal("Authentication failed");
    }
});

/**
 * Middleware to refresh tenant token if it's about to expire
 */
export const tenantRefreshTokenMiddleware = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.[TENANT_REFRESH_COOKIE];
    
    if (!refreshToken) {
        return next();
    }

    try {
        const decodedRefreshToken = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
        const user = await TenantUser.findById(decodedRefreshToken._id);

        if (user) {
            // Check if access token is about to expire (within 5 minutes)
            const accessToken = req.cookies?.[TENANT_ACCESS_COOKIE];
            if (accessToken) {
                const decodedAccessToken = jwt.decode(accessToken);
                const timeUntilExpiry = decodedAccessToken.exp * 1000 - Date.now();
                
                if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
                    // Generate new access token
                    const newAccessToken = user.generateAccessToken();
                    
                    res.cookie(TENANT_ACCESS_COOKIE, newAccessToken, accessTokenCookieOptions);

                    logger.info('Tenant access token refreshed', { userId: user._id });
                }
            }
        }
    } catch (error) {
        // If refresh token is invalid, just continue
        logger.debug('Tenant refresh token validation failed', { error: error.message });
    }

    next();
});