import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apierror.js";
import { ApiResponse } from "../../utils/apiresponse.js";
import { ValidationHelper } from "../../utils/validate.js";
import { logger } from "../../utils/Logger.js";
import { mysqlPool } from "../../db/db.js";

/**
 * Create a new database
 */
const createDatabase = asyncHandler(async (req, res) => {
    const { name,  } = req.body;
    const {project_id}= req.headers;
    const userId = req.user?.id;

    logger.info('Creating new database', { userId, name, project_id });

    // Validate required fields
    ValidationHelper.validateRequired(['name'], req.body);
    ValidationHelper.validateRequired(['project_id'], req.headers);
    ValidationHelper.validateStringLength(name, 'name', 1, 255);
    ValidationHelper.validateStringLength(project_id, 'project_id', 1, 255);

    // Sanitize inputs
    const sanitizedName = ValidationHelper.sanitizeInput(name);
    const sanitizedProjectId = ValidationHelper.sanitizeInput(project_id);

    
    try {
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

        // Delete the database record
        const deleteQuery = 'DELETE FROM databasess WHERE id = ?';
        const [result] = await mysqlPool.promise().execute(deleteQuery, [sanitizedId]);

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

export {
    createDatabase,
    deleteDatabase
};