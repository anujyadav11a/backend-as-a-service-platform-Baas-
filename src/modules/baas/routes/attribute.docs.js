/**
 * @openapi
 * /api/v1/attributes/{collection_id}/attributes:
 *   post:
 *     tags: [Attributes]
 *     summary: Add a new attribute (column) to a collection
 *     description: |
 *       **Supported attribute types:**
 *       - `VARCHAR` - Variable character string (requires `size` 1-65535)
 *       - `INT` - Integer number
 *       - `TEXT` - Long text content
 *       - `DATE` - Date only (YYYY-MM-DD)
 *       - `DATETIME` - Date and time (ISO 8601)
 *       - `BOOLEAN` - True/false value
 *       - `DECIMAL` - Decimal number
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/collectionIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttributeRequest'
 *     responses:
 *       '201':
 *         description: Attribute created
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
 *                   $ref: '#/components/schemas/Attribute'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         description: Unauthorized
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
 *       '409':
 *         description: Attribute name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/attributes/{collection_id}/attributes:
 *   get:
 *     tags: [Attributes]
 *     summary: List all attributes for a collection
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/collectionIdParam'
 *     responses:
 *       '200':
 *         description: List of attributes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttributeListResponse'
 *       '401':
 *         description: Unauthorized
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

/**
 * @openapi
 * /api/v1/attributes/{collection_id}/attributes/{attribute_id}:
 *   put:
 *     tags: [Attributes]
 *     summary: Update an attribute
 *     description: |
 *       Update attribute properties. Type changes may require data migration.
 *       Size can only be increased for VARCHAR.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/collectionIdParam'
 *       - $ref: '#/components/parameters/attributeIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttributeRequest'
 *     responses:
 *       '200':
 *         description: Attribute updated
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
 *                   $ref: '#/components/schemas/Attribute'
 *       '400':
 *         $ref: '#/components/responses/ValidationError'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Collection or attribute not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/attributes/{collection_id}/attributes/{attribute_id}:
 *   delete:
 *     tags: [Attributes]
 *     summary: Delete an attribute
 *     description: |
 *       Permanently removes the attribute and all its data from documents.
 *       This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/collectionIdParam'
 *       - $ref: '#/components/parameters/attributeIdParam'
 *     responses:
 *       '200':
 *         description: Attribute deleted
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
 *         description: Collection or attribute not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */