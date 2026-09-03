import { TenantUser } from '../models/TenantUser.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';

export const generateTenantAccessAndRefreshToken = async (userId) => {
    try {
        const user = await TenantUser.findById(userId);
        if (!user) {
            logger.error('Tenant user not found during token generation', { userId });
            throw ApiError.notFound("User not found");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        logger.info('Tenant tokens generated successfully', { userId, projectId: user.project_id });
        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error('Tenant token generation failed', { userId, error: error.message });
        throw ApiError.internal("Failed to generate authentication tokens");
    }
};