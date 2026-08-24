import jwt from 'jsonwebtoken';
import { User } from '../../modules/auth/models/User.js';
import { ConsoleSession } from '../../modules/auth/models/ConsoleSession.js';
import { ApiError } from '../utils/apierror.js';
import { logger } from '../utils/Logger.js';
import { asyncHandler } from "../utils/asynchandler.js";
import { accessTokenCookieOptions } from '../utils/cookieUtils.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.accessToken || 
                     req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw ApiError.unauthorized("Access token is required");
        }

        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user
        const user = await User.findById(decodedToken._id).select("-password -refreshtoken");
        if (!user) {
            logger.warn('Token valid but user not found', { userId: decodedToken._id });
            throw ApiError.unauthorized("Invalid access token");
        }

        // Optional: Verify session is still active
        const sessionToken = req.cookies?.sessionId;
        if (sessionToken) {
            const session = await ConsoleSession.findOne({
                session_token: sessionToken,
                user_id: user._id,
                is_active: true
            });

            if (!session || session.isExpired()) {
                logger.warn('Session expired or invalid', { 
                    userId: user._id, 
                    sessionToken: sessionToken?.substring(0, 8) + '...' 
                });
                throw ApiError.unauthorized("Session expired");
            }

            // Update last activity
            await session.updateActivity();
            req.session = session;
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            logger.warn('Invalid JWT token', { error: error.message });
            throw ApiError.unauthorized("Invalid access token");
        }
        
        if (error.name === 'TokenExpiredError') {
            logger.warn('JWT token expired', { error: error.message });
            throw ApiError.unauthorized("Access token expired");
        }

        if (error instanceof ApiError) {
            throw error;
        }

        logger.error('Authentication middleware error', { error: error.message });
        throw ApiError.internal("Authentication failed");
    }
});

/**
 * Optional middleware to check if user has specific role
 */
export const requireRole = (roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw ApiError.unauthorized("Authentication required");
        }

        const userRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!userRoles.includes(req.user.role)) {
            logger.warn('Insufficient permissions', { 
                userId: req.user._id, 
                userRole: req.user.role, 
                requiredRoles: userRoles 
            });
            throw ApiError.forbidden("Insufficient permissions");
        }

        next();
    });
};

/**
 * Middleware to refresh token if it's about to expire
 * Also rotates refresh token when used (with reuse detection)
 */
export const refreshTokenMiddleware = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
        return next();
    }

    try {
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedRefreshToken._id);

        const isRefreshTokenValid = user && await user.compareRefreshToken(refreshToken);
        
        if (isRefreshTokenValid) {
            // Check if access token is about to expire (within 5 minutes)
            const accessToken = req.cookies?.accessToken;
            if (accessToken) {
                const decodedAccessToken = jwt.decode(accessToken);
                const timeUntilExpiry = decodedAccessToken.exp * 1000 - Date.now();
                
                if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
                    // Rotate both tokens (refresh token rotation with reuse detection)
                    const newAccessToken = user.generateAccessToken();
                    const newRefreshToken = user.generateRefreshToken();
                    
                    user.refreshtoken = newRefreshToken;
                    await user.save({ validateBeforeSave: false });

                    // Update session with new refresh token
                    const session = await ConsoleSession.findOne({
                        user_id: user._id,
                        is_active: true
                    });
                    
                    if (session) {
                        session.refresh_token = newRefreshToken;
                        await session.save();
                    }

                    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
                    res.cookie("refreshToken", newRefreshToken, {
                        ...accessTokenCookieOptions,
                        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                    });

                    logger.info('Tokens rotated successfully', { userId: user._id });
                }
            }
        }
    } catch (error) {
        // If refresh token is invalid, just continue
        logger.debug('Refresh token validation failed', { error: error.message });
    }

    next();
});