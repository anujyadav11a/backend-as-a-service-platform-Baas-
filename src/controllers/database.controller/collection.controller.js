import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { ValidationHelper } from "../../utils/validate.js";
import { logger } from "../../utils/Logger.js";
import { mysqlPool } from "../../db/db.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new collection
 */
const createCollection = asyncHandler(async (req, res) => {
    const { database_id, name, project_id } = req.body;
    const userId = req.user?.id;

    logger.info('Creating new collection', { userId, name, database_id, project_id });

    // Validate required fields
    ValidationHelper.validateRequired(['database_id', 'name', 'project_id'], req.body);
    ValidationHelper.validateStringLength(name, 'name', 1, 255);
    ValidationHelper.validateStringLength(project_id, 'project_id', 1, 255);

    // Validate database_id is a number
    if (!Number.isInteger(Number(database_id))) {
        throw ApiError.badRequest('database_id must be a valid integer');
    }

    // Sanitize inputs
    const sanitizedName = ValidationHelper.sanitizeInput(name);
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id);
    const sanitizedDatabaseId = parseInt(database_id);

    try {
        // Check if database exists
        const checkDatabaseQuery = 'SELECT id FROM databasess WHERE id = ?';
        const [databaseRows] = await mysqlPool.promise().execute(checkDatabaseQuery, [sanitizedDatabaseId]);

        if (databaseRows.length === 0) {
            throw ApiError.notFound('Database not found');
        }

        // Check if collection with same name already exists in the database
        const checkCollectionQuery = 'SELECT id FROM collections WHERE name = ? AND database_id = ?';
        const [existingRows] = await mysqlPool.promise().execute(checkCollectionQuery, [sanitizedName, sanitizedDatabaseId]);

        if (existingRows.length > 0) {
            throw ApiError.conflict('Collection with this name already exists in the database');
        }

        // Generate UUID for collection id
        const collectionId = uuidv4();

        // Insert new collection record
        const insertQuery = 'INSERT INTO collections (id, database_id, name, project_id) VALUES (?, ?, ?, ?)';
        await mysqlPool.promise().execute(insertQuery, [collectionId, sanitizedDatabaseId, sanitizedName, sanitizedProjectId]);

        // Get the created collection record
        const selectQuery = 'SELECT * FROM collections WHERE id = ?';
        const [createdRows] = await mysqlPool.promise().execute(selectQuery, [collectionId]);
        const createdCollection = createdRows[0];

        logger.info('Collection created successfully', { 
            collectionId: createdCollection.id,
            name: createdCollection.name,
            database_id: createdCollection.database_id,
            project_id: createdCollection.project_id,
            userId 
        });

        const response = new ApiResponse(
            201,
            {
                id: createdCollection.id,
                database_id: createdCollection.database_id,
                name: createdCollection.name,
                project_id: createdCollection.project_id,
                created_at: createdCollection.created_at
            },
            'Collection created successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error creating collection', { 
            error: error.message, 
            name: sanitizedName, 
            database_id: sanitizedDatabaseId,
            project_id: sanitizedProjectId,
            userId 
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to create collection');
    }
});

export {
    createCollection
};