/**
 * Auth API Documentation
 * @module AuthDocs
 */

/**
 * @openapi
 * /api/v1/users/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new console user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '409':
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login console user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful
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
 *                   $ref: '#/components/schemas/LoginResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/users/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Refresh token can be provided in request body OR read from RefreshToken cookie
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       '200':
 *         description: Token refreshed
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
 *                   $ref: '#/components/schemas/RefreshTokenResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/users/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout console user (revokes refresh token)
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 * /api/v1/users/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current console user profile
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
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
 *                   $ref: '#/components/schemas/UserResponse'
 *       '401':
 *         description: Session expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/users/sessions:
 *   get:
 *     tags: [Auth]
 *     summary: Get all active sessions for current user
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     responses:
 *       '200':
 *         description: List of active sessions
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
 *                   $ref: '#/components/schemas/SessionsResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/users/sessions/{sessionId}:
 *   delete:
 *     tags: [Auth]
 *     summary: Revoke a specific session
 *     security:
 *       - bearerAuth: []
 *       - consoleCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/sessionIdParam'
 *     responses:
 *       '200':
 *         description: Session revoked
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
 *       '404':
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/tenantuser/tenantRegister:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new tenant user
 *     security:
 *       - projectIdHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantRegisterRequest'
 *     responses:
 *       '201':
 *         description: Tenant user registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '409':
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/tenantuser/tenantlogin:
 *   post:
 *     tags: [Auth]
 *     summary: Login tenant user
 *     security:
 *       - projectIdHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantLoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful
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
 *                   $ref: '#/components/schemas/LoginResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/tenantuser/tenantlogout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout tenant user
 *     security:
 *       - tenantCookieAuth: []
 *     responses:
 *       '200':
 *         description: Logged out successfully
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
 */

/**
 * @openapi
 * /api/v1/tenantuser/getTenantsessions:
 *   get:
 *     tags: [Auth]
 *     summary: Get all active sessions for tenant user
 *     security:
 *       - tenantCookieAuth: []
 *     responses:
 *       '200':
 *         description: List of active sessions
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
 *                   $ref: '#/components/schemas/SessionsResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/tenantuser/revokeSession/{sessionId}:
 *   delete:
 *     tags: [Auth]
 *     summary: Revoke a specific tenant session
 *     security:
 *       - tenantCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/sessionIdParam'
 *     responses:
 *       '200':
 *         description: Session revoked
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
 *       '404':
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/tenantuser/getCurrentUser:
 *   get:
 *     tags: [Auth]
 *     summary: Get current tenant user profile
 *     security:
 *       - tenantCookieAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
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
 *                   $ref: '#/components/schemas/UserResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Initiate Google OAuth flow
 *     description: Returns Google OAuth authorization URL
 *     responses:
 *       '200':
 *         description: OAuth URL generated
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
 *                   required: [authUrl, state]
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       example: "https://accounts.google.com/o/oauth2/v2/auth?..."
 *                     state:
 *                       type: string
 *                       example: "random_state_string"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: Handles OAuth callback and creates/authenticates user
 *     parameters:
 *       - name: code
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - name: state
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth state parameter
 *     responses:
 *       '200':
 *         description: Google OAuth authentication successful
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
 *                   $ref: '#/components/schemas/OAuthLoginResponse'
 *       '400':
 *         description: OAuth error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /auth/google/refresh/{identityId}:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh Google OAuth access token
 *     parameters:
 *       - $ref: '#/components/parameters/identityIdParam'
 *     responses:
 *       '200':
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '404':
 *         description: Identity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /auth/google/revoke/{identityId}:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke Google OAuth access
 *     parameters:
 *       - $ref: '#/components/parameters/identityIdParam'
 *     responses:
 *       '200':
 *         description: Access revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '404':
 *         description: Identity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Dummy export to make this a valid ES module for swagger-jsdoc
export const authDocs = {};