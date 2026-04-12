import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { ValidationHelper } from "../../utils/validate.js";
import { logger } from "../../utils/Logger.js";
import { mysqlPool } from "../../db/db.js";

/**
 * Helper function to extract project ID from either API key or session context
 * Supports both session-based (console users) and API key-based (tenant apps) authentication
 */
function getProjectIdFromContext(req) {
    // Priority 1: API key authentication (req.project set by apiKeyAuth middleware)
    if (req.project && req.project._id) {
        return req.project._id || req.project.id;
    }
    
    // Priority 2: Session-based authentication (project_id in headers)
    if (req.headers.project_id) {
        return req.headers.project_id;
    }
    
    // Priority 3: Project ID in body (for backward compatibility)
    if (req.body?.project_id) {
        return req.body.project_id;
    }
    
    throw ApiError.badRequest('Project ID is required. Send via X-API-Key header or project_id header/body.');
}

/**
 * Helper function to extract collection ID from either params or body
 */
function getCollectionIdFromContext(req) {
    // Priority 1: Collection ID in route params
    if (req.params.collection_id) {
        return req.params.collection_id;
    }
    
    // Priority 2: Collection ID in body (for backward compatibility)
    if (req.body?.collection_id) {
        return req.body.collection_id;
    }
    
    throw ApiError.badRequest('Collection ID is required.');
}

/**
 * Add a new document to a collection
 * This function allows tenant users to store data based on the schema they defined in the attributes table
 * Supports both session-based (console users) and API key-based (tenant apps) authentication
 */
const addDocument = asyncHandler(async (req, res) => {
    const { data } = req.body;
    
    // Support both authentication contexts
    const collection_id = getCollectionIdFromContext(req);
    const project_id = getProjectIdFromContext(req);

    logger.info('Adding new document to collection', { 
        collection_id, 
        project_id,
        dataKeys: data ? Object.keys(data) : [],
        authType: req.apiKey ? 'API_KEY' : 'SESSION'
    });

    // Validate required fields
    ValidationHelper.validateRequired(['data'], req.body);

    // Validate that data is an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw ApiError.badRequest('Data must be a valid JSON object');
    }

    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.toString().trim());

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
 * Supports both session-based and API key-based authentication
 */
const getDocuments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    // Support both authentication contexts
    const collection_id = getCollectionIdFromContext(req);
    const project_id = getProjectIdFromContext(req);

    logger.info('Retrieving documents from collection', { 
        collection_id, 
        project_id,
        page,
        limit,
        authType: req.apiKey ? 'API_KEY' : 'SESSION'
    });

    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.toString().trim());
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
 * Query documents with filtering capabilities
 * Supports filtering by field values with various operators
 * POST /documents/query
 * Body: {
 *   filters: [
 *     { field: "name", operator: "equals", value: "John" },
 *     { field: "age", operator: "greaterThan", value: 25 }
 *   ],
 *   sort: { field: "created_at", order: "desc" },
 *   page: 1,
 *   limit: 10
 * }
 */
const queryDocuments = asyncHandler(async (req, res) => {
    const { filters = [], sort, page = 1, limit = 10 } = req.body;
    
    // Support both authentication contexts
    const collection_id = getCollectionIdFromContext(req);
    const project_id = getProjectIdFromContext(req);

    logger.info('Querying documents with filters', { 
        collection_id, 
        project_id,
        filterCount: filters.length,
        page,
        limit,
        authType: req.apiKey ? 'API_KEY' : 'SESSION'
    });

    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.toString().trim());
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Validate filters array
    if (!Array.isArray(filters)) {
        throw ApiError.badRequest('Filters must be an array');
    }

    try {
        // Get all attributes for this collection to validate filter fields
        const [attributeRows] = await mysqlPool.promise().execute(
            'SELECT name, type FROM attributes WHERE collection_id = ? AND project_id = ?',
            [sanitizedCollectionId, sanitizedProjectId]
        );

        if (attributeRows.length === 0) {
            throw ApiError.badRequest('No attributes found for this collection');
        }

        const attributeMap = new Map(attributeRows.map(attr => [attr.name, attr.type]));

        // Validate and build filter conditions
        const filterConditions = buildFilterConditions(filters, attributeMap);

        // Get all documents from the collection
        const [documentRows] = await mysqlPool.promise().execute(
            'SELECT * FROM documents WHERE collection_id = ? AND project_id = ?',
            [sanitizedCollectionId, sanitizedProjectId]
        );

        // Parse and filter documents
        let filteredDocuments = documentRows.map(doc => ({
            id: doc.id,
            collection_id: doc.collection_id,
            data: JSON.parse(doc.data),
            created_at: doc.created_at,
            project_id: doc.project_id
        }));

        // Apply filters
        if (filterConditions.length > 0) {
            filteredDocuments = filteredDocuments.filter(doc => {
                return filterConditions.every(condition => {
                    return applyFilter(doc.data, condition);
                });
            });
        }

        // Apply sorting
        if (sort && sort.field) {
            const sortField = sort.field;
            const sortOrder = sort.order?.toLowerCase() === 'asc' ? 1 : -1;
            
            filteredDocuments.sort((a, b) => {
                let aVal = sortField === 'created_at' ? new Date(a.created_at) : a.data[sortField];
                let bVal = sortField === 'created_at' ? new Date(b.created_at) : b.data[sortField];
                
                if (aVal === undefined || aVal === null) return 1;
                if (bVal === undefined || bVal === null) return -1;
                
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                
                if (aVal < bVal) return -1 * sortOrder;
                if (aVal > bVal) return 1 * sortOrder;
                return 0;
            });
        }

        // Calculate pagination
        const totalDocuments = filteredDocuments.length;
        const totalPages = Math.ceil(totalDocuments / limitNumber);
        const paginatedDocuments = filteredDocuments.slice(offset, offset + limitNumber);

        logger.info('Documents queried successfully', { 
            collection_id: sanitizedCollectionId,
            project_id: sanitizedProjectId,
            totalMatched: totalDocuments,
            returned: paginatedDocuments.length
        });

        const response = new ApiResponse(
            200,
            {
                documents: paginatedDocuments,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalDocuments,
                    hasNextPage: pageNumber < totalPages,
                    hasPrevPage: pageNumber > 1
                }
            },
            'Documents queried successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error querying documents', { 
            error: error.message, 
            collection_id: sanitizedCollectionId,
            project_id: sanitizedProjectId
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to query documents');
    }
});

/**
 * Get a single document by ID
 * Supports both session-based and API key-based authentication
 */
const getDocumentById = asyncHandler(async (req, res) => {
    const { document_id } = req.params;
    
    // Support both authentication contexts
    const collection_id = getCollectionIdFromContext(req);
    const project_id = getProjectIdFromContext(req);

    logger.info('Retrieving document by ID', { 
        document_id, 
        collection_id,
        project_id,
        authType: req.apiKey ? 'API_KEY' : 'SESSION'
    });

    // Sanitize inputs
    const sanitizedDocumentId = ValidationHelper.sanitizeInput(document_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.toString().trim());

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
 * Supports both session-based and API key-based authentication
 */
const updateDocument = asyncHandler(async (req, res) => {
    const { document_id } = req.params;
    const { data } = req.body;
    
    // Support both authentication contexts
    const collection_id = getCollectionIdFromContext(req);
    const project_id = getProjectIdFromContext(req);

    logger.info('Updating document', { 
        document_id, 
        collection_id,
        project_id,
        dataKeys: data ? Object.keys(data) : [],
        authType: req.apiKey ? 'API_KEY' : 'SESSION'
    });

    // Validate required fields
    ValidationHelper.validateRequired(['data'], req.body);

    // Validate that data is an object
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw ApiError.badRequest('Data must be a valid JSON object');
    }

    // Sanitize inputs
    const sanitizedDocumentId = ValidationHelper.sanitizeInput(document_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.toString().trim());

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
 * Supports both session-based and API key-based authentication
 */
const deleteDocument = asyncHandler(async (req, res) => {
    const { document_id } = req.params;
    
    // Support both authentication contexts
    const collection_id = getCollectionIdFromContext(req);
    const project_id = getProjectIdFromContext(req);

    logger.info('Deleting document', { 
        document_id, 
        collection_id,
        project_id,
        authType: req.apiKey ? 'API_KEY' : 'SESSION'
    });

    // Sanitize inputs
    const sanitizedDocumentId = ValidationHelper.sanitizeInput(document_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.toString().trim());

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
 * Build filter conditions from the filters array
 * Validates that filter fields exist in the schema
 */
function buildFilterConditions(filters, attributeMap) {
    const validOperators = [
        'equals', 'notEquals',
        'greaterThan', 'greaterThanOrEqual',
        'lessThan', 'lessThanOrEqual',
        'contains', 'notContains',
        'startsWith', 'endsWith',
        'in', 'notIn',
        'isNull', 'isNotNull'
    ];

    return filters.map(filter => {
        const { field, operator, value } = filter;

        // Validate filter structure
        if (!field || !operator) {
            throw ApiError.badRequest('Each filter must have a field and operator');
        }

        // Validate operator
        if (!validOperators.includes(operator)) {
            throw ApiError.badRequest(`Invalid operator '${operator}'. Valid operators: ${validOperators.join(', ')}`);
        }

        // Validate field exists in schema
        if (!attributeMap.has(field)) {
            throw ApiError.badRequest(`Field '${field}' does not exist in the collection schema`);
        }

        // Validate value is provided for operators that need it
        const operatorsNeedingValue = validOperators.filter(op => !['isNull', 'isNotNull'].includes(op));
        if (operatorsNeedingValue.includes(operator) && value === undefined) {
            throw ApiError.badRequest(`Operator '${operator}' requires a value`);
        }

        return { field, operator, value };
    });
}

/**
 * Apply a single filter condition to a document's data
 */
function applyFilter(data, condition) {
    const { field, operator, value } = condition;
    const fieldValue = data[field];

    switch (operator) {
        case 'equals':
            return fieldValue === value;
        
        case 'notEquals':
            return fieldValue !== value;
        
        case 'greaterThan':
            return fieldValue > value;
        
        case 'greaterThanOrEqual':
            return fieldValue >= value;
        
        case 'lessThan':
            return fieldValue < value;
        
        case 'lessThanOrEqual':
            return fieldValue <= value;
        
        case 'contains':
            return typeof fieldValue === 'string' && fieldValue.includes(value);
        
        case 'notContains':
            return typeof fieldValue === 'string' && !fieldValue.includes(value);
        
        case 'startsWith':
            return typeof fieldValue === 'string' && fieldValue.startsWith(value);
        
        case 'endsWith':
            return typeof fieldValue === 'string' && fieldValue.endsWith(value);
        
        case 'in':
            return Array.isArray(value) && value.includes(fieldValue);
        
        case 'notIn':
            return Array.isArray(value) && !value.includes(fieldValue);
        
        case 'isNull':
            return fieldValue === null || fieldValue === undefined;
        
        case 'isNotNull':
            return fieldValue !== null && fieldValue !== undefined;
        
        default:
            return false;
    }
}

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
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

export {
    addDocument,
    getDocuments,
    queryDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
};