/**
 * Document API Documentation
 * @module DocumentDocs
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Create a new document in a collection
 *     description: |
 *       Creates a document with fields matching the collection's attribute definitions.
 *       Required fields must be provided. Field types are validated against attribute types.
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDocumentRequest'
 *     responses:
 *       '201':
 *         description: Document created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Invalid or missing API key
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

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}/documents:
 *   get:
 *     tags: [Documents]
 *     summary: Get all documents from a collection with pagination
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *       - $ref: '#/components/parameters/pageQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       '200':
 *         description: Paginated list of documents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueryDocumentsResponse'
 *       '401':
 *         description: Invalid or missing API key
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

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}/documents/query:
 *   post:
 *     tags: [Documents]
 *     summary: Query documents with filters, sorting, and pagination
 *     description: |
 *       Advanced query with filter operators.
 *       **Supported operators:**
 *       - `equals` - Equal to
 *       - `notEquals` - Not equal to
 *       - `greaterThan` - Greater than
 *       - `greaterThanOrEqual` - Greater than or equal to
 *       - `lessThan` - Less than
 *       - `lessThanOrEqual` - Less than or equal to
 *       - `contains` - Pattern matching (substring)
 *       - `notContains` - Does not contain substring
 *       - `startsWith` - Starts with
 *       - `endsWith` - Ends with
 *       - `in` - Value in array
 *       - `notIn` - Value not in array
 *       - `isNull` - Field is null
 *       - `isNotNull` - Field is not null
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueryDocumentsRequest'
 *     responses:
 *       '200':
 *         description: Query results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueryDocumentsResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Invalid or missing API key
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

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}/documents/{document_id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get a single document by ID
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *       - $ref: '#/components/parameters/documentIdParam'
 *     responses:
 *       '200':
 *         description: Document found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponse'
 *       '401':
 *         description: Invalid or missing API key
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
 *         description: Document or collection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}/documents/{document_id}:
 *   put:
 *     tags: [Documents]
 *     summary: Update a document by ID
 *     description: |
 *       Partial update - only provided fields will be updated.
 *       Fields must match collection attribute definitions.
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *       - $ref: '#/components/parameters/documentIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDocumentRequest'
 *     responses:
 *       '200':
 *         description: Document updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponse'
 *       '400':
 *         $ref: '#/components/schemas/ValidationError'
 *       '401':
 *         description: Invalid or missing API key
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
 *         description: Document or collection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/v1/projects/{project_id}/collections/{collection_id}/documents/{document_id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document by ID
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdParamSnake'
 *       - $ref: '#/components/parameters/collectionIdParam'
 *       - $ref: '#/components/parameters/documentIdParam'
 *     responses:
 *       '200':
 *         description: Document deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data, message]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: 'null'
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: 'Document deleted successfully'
 *       '401':
 *         description: Invalid or missing API key
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
 *         description: Document or collection not found
 *         content:
 *           application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

// Dummy export to make this a valid ES module for swagger-jsdoc
export const documentDocs = {};