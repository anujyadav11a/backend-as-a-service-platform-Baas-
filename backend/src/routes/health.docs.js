/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns basic server health status
 *     responses:
 *       '200':
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, status, timestamp, uptime, environment]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 *                 environment:
 *                   type: string
 *                   example: development
 */

/**
 * @openapi
 * /health/redis:
 *   get:
 *     tags: [Health]
 *     summary: Redis connectivity health check
 *     description: Tests Redis connection and measures latency
 *     responses:
 *       '200':
 *         description: Redis is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, status, service, latencyMs, timestamp]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: redis
 *                 latencyMs:
 *                   type: integer
 *                   example: 5
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '503':
 *         description: Redis unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, status, service, timestamp]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 service:
 *                   type: string
 *                   example: redis
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @openapi
 * /health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Detailed health check for all services
 *     description: Checks MongoDB, MySQL, and Redis connectivity
 *     responses:
 *       '200':
 *         description: All services healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, status, checks, timestamp]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 checks:
 *                   type: object
 *                   required: [redis, mongodb, mysql]
 *                   properties:
 *                     redis:
 *                       type: boolean
 *                       example: true
 *                     mongodb:
 *                       type: boolean
 *                       example: true
 *                     mysql:
 *                       type: boolean
 *                       example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '503':
 *         description: One or more services degraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, status, checks, timestamp]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: degraded
 *                 checks:
 *                   type: object
 *                   required: [redis, mongodb, mysql]
 *                   properties:
 *                     redis:
 *                       type: boolean
 *                       example: true
 *                     mongodb:
 *                       type: boolean
 *                       example: false
 *                     mysql:
 *                       type: boolean
 *                       example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */