import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { ValidationHelper } from "../../utils/validate.js";
import { logger } from "../../utils/Logger.js";
import { mysqlPool } from "../../db/db.js";

/**
 * Add a new document to a collection
 * This function allows tenant users to store data based on the schema they defined in the attributes table
 */
const addDocument = asyncHandler(async (req, res) => {
    const { collection_id, data } = req.body;
    const { project_id } = req.headers;

    logger.info('Adding new document to collection', { 
        collection_id, 
        project_id,
        dataKeys: data ? Object.keys(data) : []
    });

    // Validate required fields
    ValidationHelper.validateRequired(['collection_id', 'data'], req.body);
    ValidationHelper.validateRequired(['project_id'], req.headers);

    // Validate that data is an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw ApiError.badRequest('Data must be a valid JSON object');
    }

    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());

    try {
        // Step 1: Get all attributes for this collection to validate the data
        const [attributeRows] = await mysqlPool.promise().execute(
            'SELECT id, name, type, required FROM attributes WHERE collection_id = ? AND project_id = ?',
            [sanitizedCollectionId, sanitizedProjectId]
        );

        if (attributeRows.length === 0) {
            throw ApiError.badRequest('No attributes found for this collection. Please define the schema first.');
        }

        // Step 2: Validate the provided data against the schema
        const validationResult = validateDataAgainstSchema(data, attributeRows);
        if (!validationResult.isValid) {
            throw ApiError.badRequest(`Data validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Step 3: Generate a unique document ID
        const documentId = generateDocumentId();

        // Step 4: Get the first attribute ID (required for the foreign key constraint)
        const firstAttributeId = attributeRows[0].id;

        // Step 5: Insert the document into the database
        const [result] = await mysqlPool.promise().execute(
            'INSERT INTO documents (id, collection_id, data, project_id, attribute_id) VALUES (?, ?, ?, ?, ?)',
            [documentId, sanitizedCollectionId, JSON.stringify(data), sanitizedProjectId, firstAttributeId]
        );

        // Step 6: Retrieve the created document
        const [documentRows] = await mysqlPool.promise().execute(
            'SELECT * FROM documents WHERE id = ?',
            [documentId]
        );

        const createdDocument = documentRows[0];

        logger.info('Document added successfully', { 
            documentId: createdDocument.id,
            collection_id: sanitizedCollectionId,
            project_id: sanitizedProjectId
        });

        const response = new ApiResponse(
            201,
            {
                id: createdDocument.id,
                collection_id: createdDocument.collection_id,
                data: JSON.parse(createdDocument.data),
                created_at: createdDocument.created_at,
                project_id: createdDocument.project_id
            },
            'Document added successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        // Handle MySQL specific errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw ApiError.badRequest('Invalid collection_id or project_id reference');
        }

        logger.error('Database error while adding document', { 
            error: error.message, 
            collection_id: sanitizedCollectionId,
            project_id: sanitizedProjectId
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to add document to collection');
    }
});

/**
 * Get all documents from a collection
 */
const getDocuments = asyncHandler(async (req, res) => {
    const { collection_id } = req.params;
    const { project_id } = req.headers;
    const { page = 1, limit = 10 } = req.query;

    logger.info('Retrieving documents from collection', { 
        collection_id, 
        project_id,
        page,
        limit
    });

    // Validate required fields
    ValidationHelper.validateRequired(['project_id'], req.headers);

    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    try {
        // Get documents with pagination
        const [documentRows] = await mysqlPool.promise().execute(
            'SELECT * FROM documents WHERE collection_id = ? AND project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [sanitizedCollectionId, sanitizedProjectId, limitNumber, offset]
        );

        // Get total count for pagination
        const [countRows] = await mysqlPool.promise().execute(
            'SELECT COUNT(*) as total FROM documents WHERE collection_id = ? AND project_id = ?',
            [sanitizedCollectionId, sanitizedProjectId]
        );

        const totalDocuments = countRows[0].total;
        const totalPages = Math.ceil(totalDocuments / limitNumber);

        // Parse JSON data for each document
        const documents = documentRows.map(doc => ({
            id: doc.id,
            collection_id: doc.collection_id,
            data: JSON.parse(doc.data),
            created_at: doc.created_at,
            project_id: doc.project_id
        }));

        logger.info('Documents retrieved successfully', { 
            collection_id: sanitizedCollectionId,
            project_id: sanitizedProjectId,
            count: documents.length,
            totalDocuments
        });

        const response = new ApiResponse(
            200,
            {
                documents,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalDocuments,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                }
            },
            'Documents retrieved successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error retrieving documents', { 
            error: error.message, 
            collection_id: sanitizedCollectionId,
            project_id: sanitizedProjectId
        });
        
        throw ApiError.internal('Failed to retrieve documents');
    }
});

/**
 * Get a single document by ID
 */
const getDocumentById = asyncHandler(async (req, res) => {
    const { document_id } = req.params;
    const { project_id } = req.headers;

    logger.info('Retrieving document by ID', { 
        document_id, 
        project_id
    });

    // Validate required fields
    ValidationHelper.validateRequired(['project_id'], req.headers);

    // Sanitize inputs
    const sanitizedDocumentId = ValidationHelper.sanitizeInput(document_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());

    try {
        // Get the document
        const [documentRows] = await mysqlPool.promise().execute(
            'SELECT * FROM documents WHERE id = ? AND project_id = ?',
            [sanitizedDocumentId, sanitizedProjectId]
        );

        if (documentRows.length === 0) {
            throw ApiError.notFound('Document not found');
        }

        const document = documentRows[0];

        logger.info('Document retrieved successfully', { 
            document_id: sanitizedDocumentId,
            project_id: sanitizedProjectId
        });

        const response = new ApiResponse(
            200,
            {
                id: document.id,
                collection_id: document.collection_id,
                data: JSON.parse(document.data),
                created_at: document.created_at,
                project_id: document.project_id
            },
            'Document retrieved successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error retrieving document', { 
            error: error.message, 
            document_id: sanitizedDocumentId,
            project_id: sanitizedProjectId
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to retrieve document');
    }
});

/**
 * Update a document by ID
 */
const updateDocument = asyncHandler(async (req, res) => {
    const { document_id } = req.params;
    const { data } = req.body;
    const { project_id } = req.headers;

    logger.info('Updating document', { 
        document_id, 
        project_id,
        dataKeys: data ? Object.keys(data) : []
    });

    // Validate required fields
    ValidationHelper.validateRequired(['data'], req.body);
    ValidationHelper.validateRequired(['project_id'], req.headers);

    // Validate that data is an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw ApiError.badRequest('Data must be a valid JSON object');
    }

    // Sanitize inputs
    const sanitizedDocumentId = ValidationHelper.sanitizeInput(document_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());

    try {
        // Step 1: Check if document exists and get its collection_id
        const [existingDocRows] = await mysqlPool.promise().execute(
            'SELECT collection_id FROM documents WHERE id = ? AND project_id = ?',
            [sanitizedDocumentId, sanitizedProjectId]
        );

        if (existingDocRows.length === 0) {
            throw ApiError.notFound('Document not found');
        }

        const collectionId = existingDocRows[0].collection_id;

        // Step 2: Get all attributes for this collection to validate the data
        const [attributeRows] = await mysqlPool.promise().execute(
            'SELECT id, name, type, required FROM attributes WHERE collection_id = ? AND project_id = ?',
            [collectionId, sanitizedProjectId]
        );

        if (attributeRows.length === 0) {
            throw ApiError.badRequest('No attributes found for this collection');
        }

        // Step 3: Validate the provided data against the schema
        const validationResult = validateDataAgainstSchema(data, attributeRows);
        if (!validationResult.isValid) {
            throw ApiError.badRequest(`Data validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Step 4: Update the document
        const [result] = await mysqlPool.promise().execute(
            'UPDATE documents SET data = ? WHERE id = ? AND project_id = ?',
            [JSON.stringify(data), sanitizedDocumentId, sanitizedProjectId]
        );

        if (result.affectedRows === 0) {
            throw ApiError.notFound('Document not found or no changes made');
        }

        // Step 5: Retrieve the updated document
        const [updatedDocRows] = await mysqlPool.promise().execute(
            'SELECT * FROM documents WHERE id = ? AND project_id = ?',
            [sanitizedDocumentId, sanitizedProjectId]
        );

        const updatedDocument = updatedDocRows[0];

        logger.info('Document updated successfully', { 
            document_id: sanitizedDocumentId,
            project_id: sanitizedProjectId
        });

        const response = new ApiResponse(
            200,
            {
                id: updatedDocument.id,
                collection_id: updatedDocument.collection_id,
                data: JSON.parse(updatedDocument.data),
                created_at: updatedDocument.created_at,
                project_id: updatedDocument.project_id
            },
            'Document updated successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error updating document', { 
            error: error.message, 
            document_id: sanitizedDocumentId,
            project_id: sanitizedProjectId
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to update document');
    }
});

/**
 * Delete a document by ID
 */
const deleteDocument = asyncHandler(async (req, res) => {
    const { document_id } = req.params;
    const { project_id } = req.headers;

    logger.info('Deleting document', { 
        document_id, 
        project_id
    });

    // Validate required fields
    ValidationHelper.validateRequired(['project_id'], req.headers);

    // Sanitize inputs
    const sanitizedDocumentId = ValidationHelper.sanitizeInput(document_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());

    try {
        // Delete the document
        const [result] = await mysqlPool.promise().execute(
            'DELETE FROM documents WHERE id = ? AND project_id = ?',
            [sanitizedDocumentId, sanitizedProjectId]
        );

        if (result.affectedRows === 0) {
            throw ApiError.notFound('Document not found');
        }

        logger.info('Document deleted successfully', { 
            document_id: sanitizedDocumentId,
            project_id: sanitizedProjectId
        });

        const response = new ApiResponse(
            200,
            null,
            'Document deleted successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error deleting document', { 
            error: error.message, 
            document_id: sanitizedDocumentId,
            project_id: sanitizedProjectId
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to delete document');
    }
});

// Helper Functions

/**
 * Validate data against the collection's schema (attributes)
 * This ensures that the data follows the schema defined by the tenant user
 */
function validateDataAgainstSchema(data, attributes) {
    const errors = [];
    const providedFields = Object.keys(data);
    const requiredFields = attributes.filter(attr => attr.required).map(attr => attr.name);
    const allowedFields = attributes.map(attr => attr.name);

    // Check for required fields
    for (const requiredField of requiredFields) {
        if (!providedFields.includes(requiredField)) {
            errors.push(`Required field '${requiredField}' is missing`);
        }
    }

    // Check for invalid fields (fields not in schema)
    for (const providedField of providedFields) {
        if (!allowedFields.includes(providedField)) {
            errors.push(`Field '${providedField}' is not defined in the collection schema`);
        }
    }

    // Validate data types (basic validation)
    for (const attribute of attributes) {
        const fieldName = attribute.name;
        const fieldType = attribute.type.toUpperCase();
        const fieldValue = data[fieldName];

        // Skip validation if field is not provided and not required
        if (fieldValue === undefined || fieldValue === null) {
            continue;
        }

        // Basic type validation
        if (fieldType.startsWith('VARCHAR') || fieldType.startsWith('CHAR') || fieldType.includes('TEXT')) {
            if (typeof fieldValue !== 'string') {
                errors.push(`Field '${fieldName}' must be a string`);
            }
        } else if (fieldType.includes('INT') || fieldType === 'BIGINT') {
            if (!Number.isInteger(fieldValue)) {
                errors.push(`Field '${fieldName}' must be an integer`);
            }
        } else if (fieldType.includes('DECIMAL') || fieldType.includes('FLOAT') || fieldType.includes('DOUBLE')) {
            if (typeof fieldValue !== 'number') {
                errors.push(`Field '${fieldName}' must be a number`);
            }
        } else if (fieldType === 'JSON') {
            if (typeof fieldValue !== 'object') {
                errors.push(`Field '${fieldName}' must be a valid JSON object`);
            }
        } else if (fieldType === 'BOOLEAN' || fieldType === 'BOOL') {
            if (typeof fieldValue !== 'boolean') {
                errors.push(`Field '${fieldName}' must be a boolean`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate a unique document ID
 * You can customize this function based on your ID generation strategy
 */
function generateDocumentId() {
    // Simple UUID-like ID generation (you might want to use a proper UUID library)
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export {
    addDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
};