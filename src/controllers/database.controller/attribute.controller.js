import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { ValidationHelper } from "../../utils/validate.js";
import { logger } from "../../utils/Logger.js";
import { mysqlPool } from "../../db/db.js";

/**
 * Add a new column (attribute) to a collection
 */
const addColumn = asyncHandler(async (req, res) => {
    const {  name, type, required = false } = req.body;
    const { collection_id } = req.params || req.session.collectionId;
    const {project_id}= req.session.project_id;
    const {databaseId}= req.params || req.session.databaseId;

    logger.info('Adding new column to collection', { 
        collection_id, 
        name, 
        type, 
        required, 
        project_id,
        databaseId

    });

    // Validate required fields
    ValidationHelper.validateRequired([ 'name', 'type'], req.body);
    ValidationHelper.validateRequired(['collection_id'], req.params|| req.session.collectionId);
    ValidationHelper.validateRequired(['project_id'], req.session.project_id);
    ValidationHelper.validateRequired(['databaseId'], req.params || req.session.databaseId);
    
    // Sanitize inputs
    const sanitizedName = ValidationHelper.sanitizeInput(name.trim());
    const sanitizedType = ValidationHelper.sanitizeInput(type.trim().toUpperCase());
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());
    const sanitizedDatabaseId = ValidationHelper.sanitizeInput(databaseId.trim());

   

    // Check if type is valid (allow types with parentheses like VARCHAR(255))
    const baseType = sanitizedType.split('(')[0];
    if (!validSqlTypes.includes(baseType)) {
        throw ApiError.badRequest(`Invalid SQL type '${type}'. Supported types: ${validSqlTypes.join(', ')}`);
    }

    // Validate attribute name (SQL column naming rules)
    const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!nameRegex.test(sanitizedName)) {
        throw ApiError.badRequest(
            'Invalid column name. Column names must start with a letter or underscore and contain only letters, numbers, and underscores.'
        );
    }

    // Check name length (MySQL limit is 64 characters)
    if (sanitizedName.length > 64) {
        throw ApiError.badRequest('Column name cannot exceed 64 characters');
    }

    // Validate SQL data types
    const validSqlTypes = [
        // String types
        'VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT',
        // Numeric types
        'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'INTEGER', 'BIGINT',
        'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
        // Date and time types
        'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
        // Binary types
        'BINARY', 'VARBINARY', 'BLOB', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB',
        // JSON type
        'JSON',
        // Boolean type
        'BOOLEAN', 'BOOL',
        // Enum and Set
        'ENUM', 'SET'
    ];

    // Check if the provided type is valid
    let isValidType = false;
    let normalizedType = sanitizedType;

    // Check for exact match
    if (validSqlTypes.includes(sanitizedType)) {
        isValidType = true;
    } 
    // Check for types with length specification like VARCHAR(255), CHAR(10), etc.
    else if (sanitizedType.match(/^(VARCHAR|CHAR|BINARY|VARBINARY)\(\d+\)$/)) {
        isValidType = true;
    }
    // Check for DECIMAL/NUMERIC with precision like DECIMAL(10,2)
    else if (sanitizedType.match(/^(DECIMAL|NUMERIC)\(\d+,\d+\)$/)) {
        isValidType = true;
    }
    // Check for FLOAT/DOUBLE with precision
    else if (sanitizedType.match(/^(FLOAT|DOUBLE)\(\d+,\d+\)$/)) {
        isValidType = true;
    }
    // Check for ENUM with values like ENUM('value1','value2')
    else if (sanitizedType.match(/^ENUM\(.+\)$/)) {
        isValidType = true;
    }
    // Check for SET with values like SET('value1','value2')
    else if (sanitizedType.match(/^SET\(.+\)$/)) {
        isValidType = true;
    }

    if (!isValidType) {
        throw ApiError.badRequest(
            `Invalid SQL data type: '${type}'. Supported types include: ${validSqlTypes.join(', ')}. ` +
            `You can also use types with specifications like VARCHAR(255), DECIMAL(10,2), ENUM('val1','val2'), etc.`
        );
    }

    try {
        // Insert new attribute directly
        const [result] = await mysqlPool.promise().execute(
            'INSERT INTO attributes (collection_id, database_id, name, type, required, project_id) VALUES (?, ?, ?, ?, ?, ?)',
            [sanitizedCollectionId,sanitizedDatabaseId, sanitizedName,sanitizedProjectId, sanitizedType, required ? 1 : 0, project_id]
        );

        // Get the created attribute
        const [newAttributeRows] = await mysqlPool.promise().execute(
            'SELECT * FROM attributes WHERE id = ?',
            [result.insertId]
        );

        const newAttribute = newAttributeRows[0];

        logger.info('Column added successfully', { 
            attributeId: newAttribute.id,
            collection_id: sanitizedCollectionId,
            name: sanitizedName,
            project_id 
        });

        const response = new ApiResponse(
            201,
            {
                id: newAttribute.id,
                collection_id: newAttribute.collection_id,
                name: newAttribute.name,
                type: newAttribute.type,
                required: Boolean(newAttribute.required),
                project_id: newAttribute.project_id
            },
            'Column added successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        // Handle MySQL specific errors
        if (error.code === 'ER_DUP_ENTRY') {
            throw ApiError.conflict('Attribute with this name already exists in the collection');
        }
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw ApiError.badRequest('Invalid collection_id reference');
        }

        logger.error('Database error while adding column', { 
            error: error.message, 
            collection_id: sanitizedCollectionId,
            name: sanitizedName 
        });
        
        throw ApiError.internal('Failed to add column to collection');
    }
});

/**
 * List all attributes for a collection
 */
const listAttributes = asyncHandler(async (req, res) => {
    const { collection_id } = req.params;
    const { project_id } = req.session;

    logger.info('Fetching attributes for collection', { 
        collection_id, 
        project_id 
    });

    // Validate required fields
    ValidationHelper.validateRequired(['collection_id'], req.params);
    ValidationHelper.validateRequired(['project_id'], req.session);
    
    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collection_id.trim());
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id.trim());

    try {
        // Fetch all attributes for the collection with verification
        const [attributes] = await mysqlPool.promise().execute(
            `SELECT id, collection_id, database_id, name, type, required, project_id, created_at, updated_at 
             FROM attributes 
             WHERE collection_id = ? AND project_id = ? 
             ORDER BY created_at ASC`,
            [sanitizedCollectionId, sanitizedProjectId]
        );

        if (attributes.length === 0) {
            logger.warn('No attributes found for collection', { collection_id: sanitizedCollectionId });
        }

        const formattedAttributes = attributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            type: attr.type,
            required: Boolean(attr.required),
            collection_id: attr.collection_id,
            database_id: attr.database_id,
            created_at: attr.created_at,
            updated_at: attr.updated_at
        }));

        const response = new ApiResponse(
            200,
            {
                attributes: formattedAttributes,
                count: formattedAttributes.length
            },
            'Attributes fetched successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Database error while fetching attributes', { 
            error: error.message, 
            collection_id: sanitizedCollectionId
        });
        
        throw ApiError.internal('Failed to fetch attributes');
    }
});

/**
 * Update an attribute (name, type, or required field)
 */
const updateAttribute = asyncHandler(async (req, res) => {
    const { attribute_id } = req.params;
    const { name, type, required } = req.body;
    const { project_id } = req.session;

    logger.info('Updating attribute', { 
        attribute_id, 
        project_id,
        fieldsToUpdate: { name, type, required }
    });

    // Validate required fields
    ValidationHelper.validateRequired(['attribute_id'], req.params);
    ValidationHelper.validateRequired(['project_id'], req.session);

    // At least one field must be provided for update
    if (!name && !type && required === undefined) {
        throw ApiError.badRequest('At least one field (name, type, or required) must be provided for update');
    }

    try {
        // First, fetch the existing attribute to verify it exists and belongs to the project
        const [existingAttr] = await mysqlPool.promise().execute(
            'SELECT * FROM attributes WHERE id = ? AND project_id = ?',
            [attribute_id, project_id]
        );

        if (existingAttr.length === 0) {
            throw ApiError.notFound('Attribute not found or does not belong to your project');
        }

        const attribute = existingAttr[0];
        const updates = {};
        const values = [];

        // Validate and prepare name update
        if (name) {
            const sanitizedName = ValidationHelper.sanitizeInput(name.trim());
            const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
            
            if (!nameRegex.test(sanitizedName)) {
                throw ApiError.badRequest(
                    'Invalid column name. Must start with letter or underscore and contain only letters, numbers, and underscores.'
                );
            }

            if (sanitizedName.length > 64) {
                throw ApiError.badRequest('Column name cannot exceed 64 characters');
            }

            // Check for duplicate name in same collection
            const [duplicates] = await mysqlPool.promise().execute(
                'SELECT id FROM attributes WHERE name = ? AND collection_id = ? AND id != ?',
                [sanitizedName, attribute.collection_id, attribute_id]
            );

            if (duplicates.length > 0) {
                throw ApiError.conflict('An attribute with this name already exists in the collection');
            }

            updates.name = sanitizedName;
            values.push(sanitizedName);
        }

        // Validate and prepare type update
        if (type) {
            const sanitizedType = ValidationHelper.sanitizeInput(type.trim().toUpperCase());
            const validSqlTypes = [
                'VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT',
                'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'INTEGER', 'BIGINT',
                'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
                'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
                'BINARY', 'VARBINARY', 'BLOB', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB',
                'JSON', 'BOOLEAN', 'BOOL', 'ENUM', 'SET'
            ];

            const baseType = sanitizedType.split('(')[0];
            let isValidType = validSqlTypes.includes(baseType) ||
                sanitizedType.match(/^(VARCHAR|CHAR|BINARY|VARBINARY)\(\d+\)$/) ||
                sanitizedType.match(/^(DECIMAL|NUMERIC)\(\d+,\d+\)$/) ||
                sanitizedType.match(/^(FLOAT|DOUBLE)\(\d+,\d+\)$/) ||
                sanitizedType.match(/^ENUM\(.+\)$/) ||
                sanitizedType.match(/^SET\(.+\)$/);

            if (!isValidType) {
                throw ApiError.badRequest(`Invalid SQL data type: '${type}'`);
            }

            updates.type = sanitizedType;
            values.push(sanitizedType);
        }

        // Prepare required update
        if (required !== undefined) {
            updates.required = required ? 1 : 0;
            values.push(required ? 1 : 0);
        }

        // Build the UPDATE query dynamically
        const updateFields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        values.push(attribute_id, project_id);

        await mysqlPool.promise().execute(
            `UPDATE attributes SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`,
            values
        );

        // Fetch and return updated attribute
        const [updatedAttr] = await mysqlPool.promise().execute(
            'SELECT * FROM attributes WHERE id = ?',
            [attribute_id]
        );

        const updated = updatedAttr[0];

        logger.info('Attribute updated successfully', { 
            attributeId: attribute_id,
            updates: updates
        });

        const response = new ApiResponse(
            200,
            {
                id: updated.id,
                collection_id: updated.collection_id,
                database_id: updated.database_id,
                name: updated.name,
                type: updated.type,
                required: Boolean(updated.required),
                created_at: updated.created_at,
                updated_at: updated.updated_at
            },
            'Attribute updated successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        logger.error('Database error while updating attribute', { 
            error: error.message, 
            attribute_id
        });
        
        throw ApiError.internal('Failed to update attribute');
    }
});

/**
 * Delete an attribute from a collection
 * Note: This requires careful handling as deleting an attribute means removing that column from documents
 */
const deleteAttribute = asyncHandler(async (req, res) => {
    const { attribute_id } = req.params;
    const { confirm } = req.body;
    const { project_id } = req.session;

    logger.info('Deleting attribute', { 
        attribute_id, 
        project_id
    });

    // Validate required fields
    ValidationHelper.validateRequired(['attribute_id'], req.params);
    ValidationHelper.validateRequired(['project_id'], req.session);

    // Require explicit confirmation for deletion
    if (!confirm) {
        throw ApiError.badRequest('Please confirm attribute deletion by setting confirm: true in the request body');
    }

    try {
        // Fetch the attribute to verify it exists and belongs to the project
        const [attributes] = await mysqlPool.promise().execute(
            'SELECT * FROM attributes WHERE id = ? AND project_id = ?',
            [attribute_id, project_id]
        );

        if (attributes.length === 0) {
            throw ApiError.notFound('Attribute not found or does not belong to your project');
        }

        const attribute = attributes[0];

        // Check if this is the last attribute in the collection
        const [allAttributes] = await mysqlPool.promise().execute(
            'SELECT COUNT(*) as count FROM attributes WHERE collection_id = ?',
            [attribute.collection_id]
        );

        if (allAttributes[0].count === 1) {
            throw ApiError.badRequest(
                'Cannot delete the last attribute in a collection. A collection must have at least one attribute.'
            );
        }

        // Check how many documents depend on this attribute
        const [documentCount] = await mysqlPool.promise().execute(
            'SELECT COUNT(*) as count FROM documents WHERE attribute_id = ?',
            [attribute_id]
        );

        const docsAffected = documentCount[0].count;

        if (docsAffected > 0) {
            logger.warn('Deleting attribute with dependent documents', { 
                attribute_id,
                documents_affected: docsAffected
            });
        }

        // Delete the attribute (use transaction for safety)
        const connection = await mysqlPool.getConnection();
        try {
            await connection.beginTransaction();

            // Delete the attribute
            await connection.execute(
                'DELETE FROM attributes WHERE id = ? AND project_id = ?',
                [attribute_id, project_id]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        logger.info('Attribute deleted successfully', { 
            attributeId: attribute_id,
            collection_id: attribute.collection_id,
            documents_affected: docsAffected
        });

        const response = new ApiResponse(
            200,
            {
                id: attribute.id,
                name: attribute.name,
                deleted: true,
                documents_affected: docsAffected
            },
            'Attribute deleted successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        logger.error('Database error while deleting attribute', { 
            error: error.message, 
            attribute_id
        });
        
        throw ApiError.internal('Failed to delete attribute');
    }
});

export {
    addColumn,
    listAttributes,
    updateAttribute,
    deleteAttribute
};