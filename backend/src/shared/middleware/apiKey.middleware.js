import { Project } from '../../modules/project/models/Project.js';
import { ApiError } from '../utils/apierror.js';
import { logger } from '../utils/Logger.js';
import { asyncHandler } from "../utils/asynchandler.js";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from './ratelimiter.middleware.js';

/**
 * Middleware to authenticate API key for BaaS API access
 * Includes per-project rate limiting
 */
export const apiKeyAuth = asyncHandler(async (req, res, next) => {
    try {
        // Get API key from header

        const api_Key = req.header('api-key');
        console.log('API Key received:', api_Key); // Debugging log
        if (!api_Key) {
            throw ApiError.unauthorized('API key is required');
        }

        


        // Find project by api key
        const project = await Project.findByApiKey(api_Key);
        if (!project) {
            logger.warn('API key used for non-existent project', { api_Key });
            throw ApiError.unauthorized('Invalid API key');
        }

        // Check project status
        if (project.status !== 'active') {
            logger.warn('API key used for inactive project', { 
                projectId: project._id, 
                status: project.status 
            });
            throw ApiError.forbidden('Project is not active');
        }

       
        

        // Check rate limit for this project
        const projectId = project._id || project.id;
        const identifier = `project:${projectId}`;
        const config = project.rate_limit_config || RATE_LIMIT_CONFIGS.project;
        
        const rateLimitResult = await checkRateLimit(identifier, config);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
        res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded for project', {
                projectId,
                currentCount: rateLimitResult.currentCount,
                limit: rateLimitResult.limit
            });

            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Too many requests.',
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    limit: rateLimitResult.limit,
                    remaining: 0,
                    resetTime: rateLimitResult.resetTime,
                    retryAfter: rateLimitResult.resetTime - Math.floor(Date.now() / 1000)
                }
            });
        }

        // Update usage statistics
        await project.updateUsage('api_request');

        // Build minimal key info from the project (project-level key)
        const keyInfo = {
            key_id: project.api_key,
            permissions: ['*'],
            environment: 'production'
        };

        // Attach project and API key info to request
        req.project = project;
        req.apiKey = keyInfo;
        req.rateLimitInfo = rateLimitResult;
       req.uese = project.owner // Simulate user context for project owner

        logger.info('API key authenticated successfully', {
            projectId: project._id,
            keyId: keyInfo.key_id,
            environment: keyInfo.environment,
            ip: req.ip,
            rateLimit: {
                remaining: rateLimitResult.remaining,
                limit: rateLimitResult.limit
            }
        });

        next();

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        logger.error('API key authentication error', {
            error: error.message,
            stack: error.stack
        });
        throw ApiError.internal('Authentication failed');
    }
});

/**
 * Middleware to check specific API permissions
 */
export const requireApiPermission = (permission) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.apiKey) {
            throw ApiError.unauthorized('API key authentication required');
        }

        const hasPermission = req.apiKey.permissions.includes(permission) || 
                            req.apiKey.permissions.includes('admin') ||
                            req.apiKey.permissions.includes('*');

        if (!hasPermission) {
            logger.warn('Insufficient API permissions', {
                projectId: req.project._id,
                keyId: req.apiKey.key_id,
                requiredPermission: permission,
                availablePermissions: req.apiKey.permissions
            });
            throw ApiError.forbidden(`Insufficient permissions. Required: ${permission}`);
        }

        next();
    });
};

/**
 * Middleware to check environment-specific access
 */
export const requireEnvironment = (allowedEnvironments) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.apiKey) {
            throw ApiError.unauthorized('API key authentication required');
        }

        const environments = Array.isArray(allowedEnvironments) ? allowedEnvironments : [allowedEnvironments];
        
        if (!environments.includes(req.apiKey.environment)) {
            logger.warn('Environment access denied', {
                projectId: req.project._id,
                keyId: req.apiKey.key_id,
                keyEnvironment: req.apiKey.environment,
                allowedEnvironments: environments
            });
            throw ApiError.forbidden(`Access denied for ${req.apiKey.environment} environment`);
        }

        next();
    });
};



