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
 *               $ref: '#/components/schemas/HealthCheckResponse'
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
 *               $ref: '#/components/schemas/RedisHealthResponse'
 *       '503':
 *         description: Redis unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RedisHealthErrorResponse'
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
 *               $ref: '#/components/schemas/DetailedHealthResponse'
 *       '503':
 *         description: One or more services degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedHealthErrorResponse'
 */