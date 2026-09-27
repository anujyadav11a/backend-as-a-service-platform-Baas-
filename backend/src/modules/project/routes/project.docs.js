/**
 * Project API Documentation
 * @module ProjectDocs
 */

/**
 * @openapi
 * /api/v1/projects/create:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       '201':
 *         description: Project created
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
 *                   $ref: '#/components/schemas/Project'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Project name already exists
 *         content:
 *           application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Project limit reached (maximum 5 projects)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/list:
 *   get:
 *     tags: [Projects]
 *     summary: List all projects for current user
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - name: fields
 *         in: query
 *         description: Comma-separated fields to include (e.g., 'config')
 *         required: false
 *         schema:
 *           type: string
 *           example: 'config'
 *     responses:
 *       '200':
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/search:
 *   get:
 *     tags: [Projects]
 *     summary: Search projects by name
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/searchQuery'
 *     responses:
 *       '200':
 *         description: Search results
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
 *                   required: [query, count, projects]
 *                   properties:
 *                     query:
 *                       type: string
 *                       example: 'my project'
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project details
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     responses:
 *       '200':
 *         description: Project details
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
 *                   $ref: '#/components/schemas/Project'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}:
 *   put:
 *     tags: [Projects]
 *     summary: Update project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       '200':
 *         description: Project updated
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
 *                   required: [id, project_id, name, api_key, status, updated_at]
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: '64f1a2b3c4d5e6f7a8b9c0d1'
 *                     project_id:
 *                       type: string
 *                       example: 'abc123de'
 *                     name:
 *                       type: string
 *                       example: 'Updated Project'
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: 'Updated description'
 *                     api_key:
 *                       type: string
 *                       example: 'a1b2c3d4e5f6...'
 *                     status:
 *                       type: string
 *                       enum: ['active', 'suspended', 'deleted']
 *                       example: 'active'
 *                     updated_at:
 *                       type: string
 *                       format: 'date-time'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
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
 *         description: Project name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     responses:
 *       '200':
 *         description: Project deleted
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
 *                   required: [id, project_id, name]
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: '64f1a2b3c4d5e6f7a8b9c0d1'
 *                     project_id:
 *                       type: string
 *                       example: 'abc123de'
 *                     name:
 *                       type: string
 *                       example: 'My Project'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - Not project owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Failed to delete project and associated resources
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}/sdk:
 *   get:
 *     tags: [Projects]
 *     summary: Get project SDK configuration (API key + base URL)
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     responses:
 *       '200':
 *         description: SDK configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SDKDetailsResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}/config:
 *   get:
 *     tags: [Projects]
 *     summary: Get project configuration (CORS, limits)
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     responses:
 *       '200':
 *         description: Project configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectConfig'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - Not project owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}/config:
 *   patch:
 *     tags: [Projects]
 *     summary: Update project configuration (CORS, limits)
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectConfigRequest'
 *     responses:
 *       '200':
 *         description: Project configuration updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectConfig'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - Not project owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}/apikeys:
 *   post:
 *     tags: [Projects]
 *     summary: Generate new API key for project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApiKeyRequest'
 *     responses:
 *       '201':
 *         description: API key generated (only time full key is shown)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKeyGenerateResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - Not project owner
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
 * /api/v1/projects/{projectId}/apikeys:
 *   get:
 *     tags: [Projects]
 *     summary: List all API keys for project
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *     responses:
 *       '200':
 *         description: List of API keys (keys are masked)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKeyListResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - Not project owner
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
 * /api/v1/projects/{projectId}/apikeys/{keyId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Revoke an API key
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParam'
 *       - $ref: '#/components/parameters/keyIdParam'
 *     responses:
 *       '200':
 *         description: API key revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden - Not project owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Project or API key not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Dummy export to make this a valid ES module for swagger-jsdoc
export const projectDocs = {};