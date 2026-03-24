import { redis } from "../config/redis.config.js";
import { ApiError } from "../utils/apierror.js";
import { logger } from "../utils/Logger.js";

// Default rate limit configurations
const RATE_LIMIT_CONFIGS = {
    // Per-project API key limits
    project: {
        windowSize: 60, // 1 minute
        maxRequests: 100 // 100 requests per minute
    },
    // Per-IP limits (for non-authenticated requests)
    ip: {
        windowSize: 60,
        maxRequests: 20 // 20 requests per minute
    },
    // Strict limits for sensitive operations
    strict: {
        windowSize: 60,
        maxRequests: 10
    }
};

/**
 * Generic rate limiter using Redis with sliding window algorithm

 */
const checkRateLimit = async (identifier, config) => {
    const { windowSize, maxRequests } = config;
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - (windowSize * 1000);

    try {
        // Use Redis sorted set for sliding window
        const multi = redis.multi();
        
        // Remove old entries outside the window
        multi.zremrangebyscore(key, 0, windowStart);
        
        // Count requests in current window
        multi.zcard(key);
        
        // Add current request with timestamp as score
        multi.zadd(key, now, `${now}-${Math.random()}`);
        
        // Set expiry on the key
        multi.expire(key, windowSize);
        
        const results = await multi.exec();
        
        // results[1] contains the count before adding current request
        const currentCount = results[1][1];
        
        const allowed = currentCount < maxRequests;
        const remaining = Math.max(0, maxRequests - currentCount - 1);
        
        // Get oldest request timestamp for reset time calculation
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestRequest.length > 0 
            ? Math.ceil((parseInt(oldestRequest[1]) + (windowSize * 1000)) / 1000)
            : Math.ceil((now + (windowSize * 1000)) / 1000);

        return {
            allowed,
            limit: maxRequests,
            remaining,
            resetTime,
            currentCount: currentCount + 1
        };

    } catch (error) {
        logger.error('Rate limit check failed', {
            identifier,
            error: error.message
        });
        
        // Fail open - allow request if Redis is down
        return {
            allowed: true,
            limit: maxRequests,
            remaining: maxRequests,
            resetTime: Math.ceil((now + (windowSize * 1000)) / 1000),
            currentCount: 0,
            error: true
        };
    }
};

/**
 * Rate limiter middleware for per-project API key limits
 */
export const projectRateLimiter = async (req, res, next) => {
    try {
        // This middleware should be used after apiKeyAuth
        if (!req.project) {
            logger.warn('Project rate limiter used without project context');
            return next();
        }

        const projectId = req.project._id || req.project.id;
        const identifier = `project:${projectId}`;
        
        // Get custom rate limit from project or use default
        const config = req.project.rate_limit_config || RATE_LIMIT_CONFIGS.project;
        
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

        // Attach rate limit info to request for logging
        req.rateLimitInfo = rateLimitResult;

        next();

    } catch (error) {
        logger.error('Project rate limiter error', {
            error: error.message,
            stack: error.stack
        });
        // Fail open - allow request on error
        next();
    }
};

/**
 * Rate limiter middleware for IP-based limits (for non-authenticated requests)
 */
export const ipRateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const identifier = `ip:${ip}`;
        
        const rateLimitResult = await checkRateLimit(identifier, RATE_LIMIT_CONFIGS.ip);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
        res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);

        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded for IP', {
                ip,
                currentCount: rateLimitResult.currentCount,
                limit: rateLimitResult.limit
            });

            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: rateLimitResult.resetTime - Math.floor(Date.now() / 1000)
                }
            });
        }

        next();

    } catch (error) {
        logger.error('IP rate limiter error', {
            error: error.message,
            stack: error.stack
        });
        // Fail open - allow request on error
        next();
    }
};

/**
 * Strict rate limiter for sensitive operations (auth, password reset, etc.)
 */
export const strictRateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const identifier = `strict:${ip}`;
        
        const rateLimitResult = await checkRateLimit(identifier, RATE_LIMIT_CONFIGS.strict);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
        res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
        res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);

        if (!rateLimitResult.allowed) {
            logger.warn('Strict rate limit exceeded', {
                ip,
                path: req.path,
                currentCount: rateLimitResult.currentCount,
                limit: rateLimitResult.limit
            });

            return res.status(429).json({
                success: false,
                message: 'Too many attempts. Please try again later.',
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: rateLimitResult.resetTime - Math.floor(Date.now() / 1000)
                }
            });
        }

        next();

    } catch (error) {
        logger.error('Strict rate limiter error', {
            error: error.message,
            stack: error.stack
        });
        // Fail open - allow request on error
        next();
    }
};

/**
 * Custom rate limiter factory for specific use cases

 */
export const customRateLimiter = (config, identifierFn) => {
    return async (req, res, next) => {
        try {
            const identifier = identifierFn(req);
            
            if (!identifier) {
                logger.warn('Custom rate limiter: no identifier found');
                return next();
            }

            const rateLimitResult = await checkRateLimit(identifier, config);

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
            res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
            res.setHeader('X-RateLimit-Reset', rateLimitResult.resetTime);

            if (!rateLimitResult.allowed) {
                logger.warn('Custom rate limit exceeded', {
                    identifier,
                    currentCount: rateLimitResult.currentCount,
                    limit: rateLimitResult.limit
                });

                return res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded.',
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        retryAfter: rateLimitResult.resetTime - Math.floor(Date.now() / 1000)
                    }
                });
            }

            next();

        } catch (error) {
            logger.error('Custom rate limiter error', {
                error: error.message,
                stack: error.stack
            });
            // Fail open - allow request on error
            next();
        }
    };
};

// Export the check function for use in other middleware
export { checkRateLimit, RATE_LIMIT_CONFIGS };