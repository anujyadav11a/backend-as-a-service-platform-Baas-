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

export {
    addColumn
};