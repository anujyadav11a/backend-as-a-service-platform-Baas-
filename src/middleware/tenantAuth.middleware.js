import jwt from 'jsonwebtoken';
import { TenantUser } from '../models/Auth/Tenent/Tuser.model.js';
import { TenantSession } from '../models/Auth/Tenent/Tsession.model.js';
import { ApiError } from '../utils/apierror.js';
import { logger } from '../utils/Logger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Middleware to authenticate tenant users
 */
export const tenantAuthMiddleware = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.tenantAccessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw ApiError.unauthorized("Access token is required");
        }

        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find tenant user
        const user = await TenantUser.findById(decodedToken._id).select("-password");
        if (!user) {
            logger.warn('Token valid but tenant user not found', { userId: decodedToken._id });
            throw ApiError.unauthorized("Invalid access token");
        }

        // Verify session is still active
        const sessionId = req.cookies?.sessionId;
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
    const refreshToken = req.cookies?.tenantRefreshToken;
    
    if (!refreshToken) {
        return next();
    }

    try {
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await TenantUser.findById(decodedRefreshToken._id);

        if (user) {
            // Check if access token is about to expire (within 5 minutes)
            const accessToken = req.cookies?.tenantAccessToken;
            if (accessToken) {
                const decodedAccessToken = jwt.decode(accessToken);
                const timeUntilExpiry = decodedAccessToken.exp * 1000 - Date.now();
                
                if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
                    // Generate new access token
                    const newAccessToken = user.generateAccessToken();
                    
                    res.cookie("tenantAccessToken", newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 24 * 60 * 60 * 1000 // 1 day
                    });

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