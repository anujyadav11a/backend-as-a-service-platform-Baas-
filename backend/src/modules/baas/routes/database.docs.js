/**
 * Database API Documentation
 * @module DatabaseDocs
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/databases:
 *   post:
 *     tags: [Databases]
 *     summary: Create a new database within a project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDatabaseRequest'
 *     responses:
 *       '201':
 *         description: Database created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Database'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - No access to project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Database name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/databases:
 *   get:
 *     tags: [Databases]
 *     summary: List all databases in a project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *     responses:
 *       '200':
 *         description: List of databases
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseListResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - No access to project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/databases/{database_id}:
 *   delete:
 *     tags: [Databases]
 *     summary: Delete a database
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/databaseIdParam'
 *     responses:
 *       '200':
 *         description: Database deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   required: [id, name, project_id]
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: '64f1a2b3c4d5e6f7a8b9c0d1'
 *                     name:
 *                       type: string
 *                       example: 'my_database'
 *                     project_id:
 *                       type: string
 *                       example: 'proj_abc123'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - No access to project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Database not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Dummy export to make this a valid ES module for swagger-jsdoc
export const databaseDocs = {};