import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ConsoleSession } from '../models/ConsoleSession.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.error('User not found during token generation', { userId });
            throw ApiError.notFound("User not found");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });

        logger.info('Tokens generated successfully', { userId });
        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error('Token generation failed', { userId, error: error.message });
        throw ApiError.internal("Failed to generate authentication tokens");
    }
};

export const rotateRefreshToken = async (userId, oldRefreshToken, req) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            logger.error('User not found during token rotation', { userId });
            throw ApiError.notFound("User not found");
        }

        // Verify the old refresh token matches
        const isValid = await user.compareRefreshToken(oldRefreshToken);
        if (!isValid) {
            // REUSE DETECTION: Token doesn't match - possible theft
            logger.warn('Refresh token reuse detected - revoking all sessions', { userId });
            
            // Revoke all user sessions
            await ConsoleSession.invalidateAllUserSessions(userId);
            await User.findByIdAndUpdate(userId, { refreshtoken: null });
            
            // Emit security event
            eventBus.emit(AuthEvents.REFRESH_TOKEN_REUSE_DETECTED, {
                userId,
                ip: req?.ip,
                userAgent: req?.headers?.['user-agent']
            });
            
            throw ApiError.unauthorized("Token reuse detected. All sessions revoked for security.");
        }

        // Generate new token pair
        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        
        // Update user with new refresh token
        user.refreshtoken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Update session with new refresh token
        const session = await ConsoleSession.findOne({
            user_id: userId,
            is_active: true
        });
        
        if (session) {
            session.refresh_token = newRefreshToken;
            await session.save();
        }

        logger.info('Refresh token rotated successfully', { userId });
        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error('Token rotation failed', { userId, error: error.message });
        throw ApiError.internal("Failed to rotate authentication tokens");
    }
};