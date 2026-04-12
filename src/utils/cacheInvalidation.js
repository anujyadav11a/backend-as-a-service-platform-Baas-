import { redis } from "../config/redis.config.js";
import { logger } from "./Logger.js";

/**
 * Simple cache invalidation helper
 * Deletes specific cache keys when data changes
 * 
 * @param {string[]} keys - Array of cache keys to delete
 * @example
 * await invalidateCache(['project-list:user123', 'project:proj456'])
 */
export const invalidateCache = async (keys) => {
    if (!keys || keys.length === 0) {
        return;
    }

    try {
        // Delete all specified keys
        const result = await redis.del(...keys);
        
        logger.info('Cache invalidated', { 
            keys, 
            deletedCount: result 
        });
        
        return result;
    } catch (error) {
        // Don't throw error - cache invalidation failure shouldn't break the app
        logger.error('Cache invalidation failed', { 
            keys, 
            error: error.message 
        });
    }
};

/**
 * Helper to build cache keys for invalidation
 */
export const CacheKeys = {
    // Project-related cache keys
    projectList: (userId) => `project-list:${userId}`,
    project: (projectId) => `project:${projectId}`,
    sdkDetails: (userId) => `sdk-details:${userId}`,
    databaseList: (projectId) => `database-list:${projectId}`,
    
    // User-related cache keys
    currentUser: (userId) => `currentUser:${userId}`,
};
