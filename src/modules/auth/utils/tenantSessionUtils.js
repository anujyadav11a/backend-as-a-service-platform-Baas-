import { TenantSession } from '../models/TenantSession.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { parseUserAgent, getLocationFromIP } from '../../../shared/utils/authHelpers.js';

export const createTenantSession = async (user, req, refreshToken) => {
    try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = parseUserAgent(userAgent);

        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        const locationData = await getLocationFromIP(ipAddress);

        const sessionData = {
            user_id: user._id,
            project_id: user.project_id,
            refresh_token: refreshToken,
            device_info: deviceInfo,
            location: {
                ip_address: ipAddress,
                ...locationData
            }
        };

        const session = await TenantSession.createSession(sessionData);

        logger.info('Tenant session created', {
            userId: user._id,
            projectId: user.project_id,
            sessionId: session._id,
            ipAddress,
            deviceType: deviceInfo.device_type
        });

        return session;
    } catch (error) {
        logger.error('Failed to create tenant session', {
            userId: user._id,
            projectId: user.project_id,
            error: error.message
        });
        throw ApiError.internal("Failed to create user session");
    }
};