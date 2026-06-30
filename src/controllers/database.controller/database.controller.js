import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { ValidationHelper } from "../../utils/validate.js";
import { logger } from "../../utils/Logger.js";
import { mysqlPool } from "../../db/db.js";
import { invalidateCache, CacheKeys } from "../../utils/cacheInvalidation.js";
import { Project } from "../../models/Database/project.model.js";

/**
 * Create a new database
 */
const createDatabase = asyncHandler(async (req, res) => {
    const { name,  } = req.body;
    const {project_id}= req.params || req.session.project_id;
    const userId = req.user?.id;

    logger.info('Creating new database', { userId, name, project_id });

    // Validate required fields
    ValidationHelper.validateRequired(['name'], req.body);
    ValidationHelper.validateRequired(['project_id'], req.params || req.session.project_id);
    ValidationHelper.validateStringLength(name, 'name', 1, 255);
    ValidationHelper.validateStringLength(project_id, 'project_id', 1, 255);

    // Sanitize inputs
    const sanitizedName = ValidationHelper.sanitizeInput(name);
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id);

    
    try {
        // Verify project exists AND belongs to authenticated user (SECURITY CHECK)
        const project = await Project.findOne({
            project_id: sanitizedProjectId,
            owner_id: userId,
            status: 'active'
        });

        if (!project) {
            logger.warn('Database creation attempted for unauthorized project', {
                userId,
                project_id: sanitizedProjectId
            });
            throw ApiError.forbidden('Project not found or access denied');
        }

        logger.info('Project ownership verified', {
            userId,
            project_id: sanitizedProjectId,
            projectName: project.name
        });

        // Check if database with same name and project_id already exists
        const checkQuery = 'SELECT id FROM databasess WHERE name = ? AND project_id = ?';
        const [existingRows] = await mysqlPool.promise().execute(checkQuery, [sanitizedName, sanitizedProjectId]);

        if (existingRows.length > 0) {
            throw ApiError.conflict('Database with this name already exists in the project');
        }

        // Insert new database record
        const insertQuery = 'INSERT INTO databasess (name, project_id) VALUES (?, ?)';
        const [result] = await mysqlPool.promise().execute(insertQuery, [sanitizedName, sanitizedProjectId]);

        // Get the created database record
        const selectQuery = 'SELECT * FROM databasess WHERE id = ?';
        const [createdRows] = await mysqlPool.promise().execute(selectQuery, [result.insertId]);
        const createdDatabase = createdRows[0];

        // Store database ID in session for next API calls
        req.session.databaseId = createdDatabase.id;

        // Invalidate database list cache for this project
        await invalidateCache([
            CacheKeys.databaseList(sanitizedProjectId)
        ]);

        logger.info('Database created successfully', { 
            databaseId: createdDatabase.id,
            name: createdDatabase.name,
            project_id: createdDatabase.project_id,
            userId 
        });

        const response = new ApiResponse(
            201,
            {
                id: createdDatabase.id,
                name: createdDatabase.name,
                project_id: createdDatabase.project_id
            },
            'Database created successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error creating database', { 
            error: error.message, 
            name: sanitizedName, 
            project_id: sanitizedProjectId,
            userId 
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to create database');
    }
});
/**
 * Delete a database by ID
 */
const deleteDatabase = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    logger.info('Deleting database', { databaseId: id, userId });

    // Validate required fields
    ValidationHelper.validateRequired(['id'], req.params);
    ValidationHelper.validateStringLength(id, 'id', 1, 255);

    // Sanitize inputs
    const sanitizedId = ValidationHelper.sanitizeInput(id);

    try {
        // Check if database exists
        const checkQuery = 'SELECT id, name, project_id FROM databasess WHERE id = ?';
        const [existingRows] = await mysqlPool.promise().execute(checkQuery, [sanitizedId]);

        if (existingRows.length === 0) {
            throw ApiError.notFound('Database not found');
        }

        const database = existingRows[0];

        // Verify project belongs to authenticated user (SECURITY CHECK)
        const project = await Project.findOne({
            project_id: database.project_id,
            owner_id: userId,
            status: 'active'
        });

        if (!project) {
            logger.warn('Database deletion attempted for unauthorized project', {
                userId,
                project_id: database.project_id,
                databaseId: sanitizedId
            });
            throw ApiError.forbidden('Project not found or access denied');
        }

        logger.info('Project ownership verified for database deletion', {
            userId,
            project_id: database.project_id,
            databaseId: sanitizedId
        });

        // Delete the database record
        const deleteQuery = 'DELETE FROM databasess WHERE id = ?';
        const [result] = await mysqlPool.promise().execute(deleteQuery, [sanitizedId]);

        // Invalidate database list cache for this project
        await invalidateCache([
            CacheKeys.databaseList(database.project_id)
        ]);

        logger.info('Database deleted successfully', { 
            databaseId: database.id,
            name: database.name,
            project_id: database.project_id,
            userId 
        });

        const response = new ApiResponse(
            200,
            {
                id: database.id,
                name: database.name,
                project_id: database.project_id
            },
            'Database deleted successfully'
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error deleting database', { 
            error: error.message, 
            databaseId: sanitizedId,
            userId 
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to delete database');
    }
});

/**
 * List all databases for a specific project
 */
const listAllDatabases = asyncHandler(async (req, res) => {
    const {project_id} = req.params;
    const userId = req.user?.id;

    logger.info('Listing all databases for project', { project_id, userId });

    // Validate required fields
    ValidationHelper.validateRequired(['project_id'], req.params);

    // Sanitize inputs
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id);

    try {
        // Verify project belongs to authenticated user (SECURITY CHECK)
        const project = await Project.findOne({
            project_id: sanitizedProjectId,
            owner_id: userId,
            status: 'active'
        });

        if (!project) {
            logger.warn('Database list attempted for unauthorized project', {
                userId,
                project_id: sanitizedProjectId
            });
            throw ApiError.forbidden('Project not found or access denied');
        }

        logger.info('Project ownership verified for database listing', {
            userId,
            project_id: sanitizedProjectId,
            projectName: project.name
        });

        // Query all databases for the project
        const selectQuery = 'SELECT id, name, project_id, created_at, updated_at FROM databasess WHERE project_id = ? ORDER BY created_at DESC';
        const [databases] = await mysqlPool.promise().execute(selectQuery, [sanitizedProjectId]);

        logger.info('Databases retrieved successfully', { 
            project_id: sanitizedProjectId,
            totalCount: databases.length,
            userId 
        });

        const response = new ApiResponse(
            200,
            {
                project_id: sanitizedProjectId,
                total_databases: databases.length,
                databases: databases.map(db => ({
                    id: db.id,
                    name: db.name,
                    project_id: db.project_id,
                    created_at: db.created_at,
                    updated_at: db.updated_at
                }))
            },
            `Retrieved ${databases.length} database(s)`
        );

        res.status(response.statuscode).json(response);

    } catch (error) {
        logger.error('Error listing databases', { 
            error: error.message, 
            project_id: sanitizedProjectId,
            userId 
        });
        
        // Re-throw ApiError instances, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internal('Failed to list databases');
    }
});

export {
    createDatabase,
    deleteDatabase,
    listAllDatabases
};