import crypto from 'crypto';
import { ConsoleSession } from '../models/ConsoleSession.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { parseUserAgent, getLocationFromIP } from '../../../shared/utils/authHelpers.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';

export const createUserSession = async (user, req, sessionToken, refreshToken) => {
    try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = parseUserAgent(userAgent);
        
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        
        const session = new ConsoleSession({
            user_id: user._id,
            session_token: sessionToken,
            refresh_token: refreshToken,
            ip_address: ipAddress,
            user_agent: userAgent,
            device_info: deviceInfo,
            location: await getLocationFromIP(ipAddress),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            login_method: 'email_password',
            is_active: true
        });

        const savedSession = await session.save();
        
        logger.info('User session created', {
            userId: user._id,
            sessionId: savedSession._id,
            ipAddress,
            deviceType: deviceInfo.device_type
        });

        return savedSession;
    } catch (error) {
        logger.error('Failed to create user session', {
            userId: user._id,
            error: error.message
        });
        throw ApiError.internal("Failed to create user session");
    }
};