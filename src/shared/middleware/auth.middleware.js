import jwt from 'jsonwebtoken';
import { User } from '../../modules/auth/models/User.js';
import { ApiError } from '../utils/apierror.js';
import { logger } from '../utils/Logger.js';
import { asyncHandler } from "../utils/asynchandler.js";
import { COOKIE_NAMES, accessTokenCookieOptions, refreshTokenCookieOptions } from '../utils/cookieUtils.js';
import config from '../config/env.js';
import { redis } from '../config/redis.config.js';

const { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE, session: SESSION_COOKIE } = COOKIE_NAMES.console;

const ROTATION_LOCK_TTL = 10; // seconds
const ROTATION_LOCK_RETRY_DELAY = 50; // ms

export const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.[ACCESS_COOKIE] || 
                      req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw ApiError.unauthorized("Access token is required");
        }

        // Verify JWT token
        const decodedToken = jwt.verify(token, config.jwt.accessTokenSecret);
        
        // Find user
        const user = await User.findById(decodedToken._id).select("-password -refreshtoken");
        if (!user) {
            logger.warn('Token valid but user not found', { userId: decodedToken._id });
            throw ApiError.unauthorized("Invalid access token");
        }


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
    // Skip explicit refresh endpoints - they handle their own rotation
    if (req.path === '/api/v1/users/refresh' || req.path === '/api/v1/tenantuser/refresh') {
        return next();
    }

    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    
    if (!refreshToken) {
        return next();
    }

    let lockAcquired = false;
    let lockValue = null;
    let lockKey = null;

    try {
        const decodedRefreshToken = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
        const userId = decodedRefreshToken._id;

        lockKey = `token:rotate:${userId}`;
        lockValue = `${Date.now()}:${Math.random()}`;

        const acquired = await redis.set(lockKey, lockValue, 'EX', ROTATION_LOCK_TTL, 'NX');
        
        if (!acquired) {
            await new Promise(r => setTimeout(r, ROTATION_LOCK_RETRY_DELAY));
            return next();
        }

        lockAcquired = true;

        const user = await User.findById(userId);
        const isRefreshTokenValid = user && await user.compareRefreshToken(refreshToken);
        
        if (!isRefreshTokenValid) {
            return next();
        }

        const accessToken = req.cookies?.[ACCESS_COOKIE];
        if (!accessToken) {
            return next();
        }

        const decodedAccessToken = jwt.decode(accessToken);
        const timeUntilExpiry = decodedAccessToken.exp * 1000 - Date.now();
        
        if (timeUntilExpiry >= 5 * 60 * 1000) {
            return next();
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        
        user.refreshtoken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const session = await ConsoleSession.findOne({
            user_id: user._id,
            is_active: true
        });
        
        if (session) {
            session.refresh_token = newRefreshToken;
            await session.save();
        }

        res.cookie(ACCESS_COOKIE, newAccessToken, accessTokenCookieOptions);
        res.cookie(REFRESH_COOKIE, newRefreshToken, refreshTokenCookieOptions);

        logger.info('Tokens rotated successfully', { userId: user._id });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            logger.debug('Refresh token validation failed', { error: error.message });
        } else {
            logger.error('Token rotation error', { error: error.message });
        }
    } finally {
        if (lockAcquired && lockValue && lockKey) {
            const releaseScript = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;
            try {
                await redis.eval(releaseScript, 1, lockKey, lockValue);
            } catch (e) {
                logger.warn('Failed to release rotation lock', { error: e.message });
            }
        }
    }

    next();
});