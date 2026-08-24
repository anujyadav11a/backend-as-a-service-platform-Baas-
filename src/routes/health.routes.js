import express from 'express';
import { redis } from '../shared/config/redis.config.js';
import { ApiError } from '../shared/utils/apierror.js';
import { asyncHandler } from '../shared/utils/asynchandler.js';

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
}));

router.get('/health/redis', asyncHandler(async (req, res) => {
    try {
        const start = Date.now();
        await redis.ping();
        const latency = Date.now() - start;
        
        res.json({
            success: true,
            status: 'healthy',
            service: 'redis',
            latencyMs: latency,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        throw new ApiError(503, 'Redis unavailable', 'REDIS_UNAVAILABLE');
    }
}));

router.get('/health/detailed', asyncHandler(async (req, res) => {
    const checks = {
        redis: false,
        mongodb: false,
        mysql: false
    };
    
    try {
        await redis.ping();
        checks.redis = true;
    } catch (e) {
        checks.redis = false;
    }
    
    const allHealthy = Object.values(checks).every(v => v);
    
    res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString()
    });
}));

export default router;