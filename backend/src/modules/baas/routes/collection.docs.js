/**
 * Collection API Documentation
 * @module CollectionDocs
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/databases/{database_id}/collections:
 *   post:
 *     tags: [Collections]
 *     summary: Create a new collection in a database
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/databaseIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCollectionRequest'
 *     responses:
 *       '201':
 *         description: Collection created
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
 *                   $ref: '#/components/schemas/Collection'
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
 *         description: Database not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Collection name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/databases/{database_id}/collections:
 *   get:
 *     tags: [Collections]
 *     summary: List all collections in a database
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/databaseIdParam'
 *     responses:
 *       '200':
 *         description: List of collections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionListResponse'
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

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}:
 *   delete:
 *     tags: [Collections]
 *     summary: Delete a collection
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *     responses:
 *       '200':
 *         description: Collection deleted
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
 *                   required: [id, name, database_id, project_id]
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: '64f1a2b3c4d5e6f7a8b9c0d1'
 *                     name:
 *                       type: string
 *                       example: 'users_collection'
 *                     database_id:
 *                       type: string
 *                       example: 'db_abc123'
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
 *         description: Collection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Dummy export to make this a valid ES module for swagger-jsdoc
export const collectionDocs = {};