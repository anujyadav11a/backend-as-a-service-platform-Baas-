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
    const {  name,  } = req.body;
    const database_id = req.params || req.session.databaseId; // Get database ID from session
    const {project_id}= req.session.project_id;
    const userId = req.user?.id;

    logger.info('Creating new collection', { userId, name, database_id, project_id });

    // Validate required fields
    ValidationHelper.validateRequired([ 'name'], req.body);
    ValidationHelper.validateRequired(['database_id'], req.session.databaseId || req.params);
    ValidationHelper.validateRequired(['project_id'], req.session.project_id);
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

        req.session.collectionId = createdCollection.id; // Store collection ID in session for next API calls

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

/**
 * Delete a collection by ID
 */
const deleteCollection = asyncHandler(async (req, res) => {
    const { collectionId } = req.params || req.session.collectionId; // Get collection ID from session or params
    const database_id = req.session.databaseId;
    const { project_id } = req.session.project_id;
    const userId = req.user?.id;

    logger.info('Deleting collection', { collectionId, database_id, project_id, userId });

    // Validate required fields
    ValidationHelper.validateRequired(['collectionId'], req.params||req.session.collectionId);
    ValidationHelper.validateRequired(['database_id'], req.params || req.session.databaseId);
    ValidationHelper.validateRequired(['project_id'], req.session.project_id);
    ValidationHelper.validateStringLength(collectionId, 'collectionId', 1, 255);

    // Sanitize inputs
    const sanitizedCollectionId = ValidationHelper.sanitizeInput(collectionId);
    const sanitizedDatabaseId = parseInt(database_id);
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id);

    try {
        // Check if collection exists
        const checkQuery = 'SELECT id, name, database_id, project_id FROM collections WHERE id = ? AND database_id = ? AND project_id = ?';
        const [existingRows] = await mysqlPool.promise().execute(checkQuery, [sanitizedCollectionId, sanitizedDatabaseId, sanitizedProjectId]);

        if (existingRows.length === 0) {
            throw ApiError.notFound('Collection not found');
        }

        const collection = existingRows[0];

        // Delete the collection record
        const deleteQuery = 'DELETE FROM collections WHERE id = ?';
        await mysqlPool.promise().execute(deleteQuery, [sanitizedCollectionId]);

        logger.info('Collection deleted successfully', { 
            collectionId: collection.id,
            name: collection.name,
            database_id: collection.database_id,
            project_id: collection.project_id,
            userId 
        });

        const response = new ApiResponse(
            200,
            {
                id: collection.id,
                name: collection.name,
                database_id: collection.database_id,
                project_id: collection.project_id
            },
            'Collection deleted successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error deleting collection', { 
            error: error.message, 
            collectionId: sanitizedCollectionId,
            database_id: sanitizedDatabaseId,
            project_id: sanitizedProjectId,
            userId 
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to delete collection');
    }
});



/**
 * List all collections for a particular database and project
 */
const listAllCollections = asyncHandler(async (req, res) => {
    const database_id = req.session.databaseId || req.params.databaseId;
    const { project_id } = req.session.project_id;
    const userId = req.user?.id;

    logger.info('Listing all collections', { database_id, project_id, userId });

    // Validate required fields
    ValidationHelper.validateRequired(['database_id'], database_id || req.session.databaseId);
    ValidationHelper.validateRequired(['project_id'], req.session.project_id);

    // Validate database_id is a number
    if (!Number.isInteger(Number(database_id))) {
        throw ApiError.badRequest('database_id must be a valid integer');
    }

    // Sanitize inputs
    const sanitizedDatabaseId = parseInt(database_id);
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id);

    try {
        // Check if database exists
        const checkDatabaseQuery = 'SELECT id FROM databasess WHERE id = ? AND project_id = ?';
        const [databaseRows] = await mysqlPool.promise().execute(checkDatabaseQuery, [sanitizedDatabaseId, sanitizedProjectId]);

        if (databaseRows.length === 0) {
            throw ApiError.notFound('Database not found');
        }

        // Query all collections for the database and project
        const selectQuery = 'SELECT id, database_id, name, project_id, created_at, updated_at FROM collections WHERE database_id = ? AND project_id = ? ORDER BY created_at DESC';
        const [collections] = await mysqlPool.promise().execute(selectQuery, [sanitizedDatabaseId, sanitizedProjectId]);

        logger.info('Collections retrieved successfully', { 
            database_id: sanitizedDatabaseId,
            project_id: sanitizedProjectId,
            totalCount: collections.length,
            userId 
        });

        const response = new ApiResponse(
            200,
            {
                database_id: sanitizedDatabaseId,
                project_id: sanitizedProjectId,
                total_collections: collections.length,
                collections: collections.map(col => ({
                    id: col.id,
                    name: col.name,
                    database_id: col.database_id,
                    project_id: col.project_id,
                    created_at: col.created_at,
                    updated_at: col.updated_at
                }))
            },
            `Retrieved ${collections.length} collection(s)`
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error listing collections', { 
            error: error.message, 
            database_id: sanitizedDatabaseId,
            project_id: sanitizedProjectId,
            userId 
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to list collections');
    }
});

export {
    createCollection,
    deleteCollection,
    listAllCollections
};