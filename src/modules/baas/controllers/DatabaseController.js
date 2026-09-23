import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { ApiError } from '../../../shared/utils/apierror.js';

export const createDatabase = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const projectId = req.projectId;
    const userId = req.user?.id;

    const database = await DatabaseService.create({ projectId, name, userId });

    const response = new ApiResponse(
        201,
        {
            id: database.id,
            name: database.name,
            project_id: database.project_id
        },
        'Database created successfully'
    );

    res.status(response.statuscode).json(response);
});

export const deleteDatabase = asyncHandler(async (req, res) => {
    const { database_id } = req.params;
    const projectId = req.projectId;
    const userId = req.user?.id;

    const deleted = await DatabaseService.delete({ projectId, databaseId: database_id, userId });

    const response = new ApiResponse(
        200,
        {
            id: deleted.id,
            name: deleted.name,
            project_id: deleted.project_id
        },
        'Database deleted successfully'
    );

    res.status(response.statuscode).json(response);
});

export const listAllDatabases = asyncHandler(async (req, res) => {
    const projectId = req.projectId;
    const userId = req.user?.id;

    const databases = await DatabaseService.listByProject({ projectId, userId });

    const response = new ApiResponse(
        200,
        {
            project_id: projectId,
            total_databases: databases.length,
            databases
        },
        `Retrieved ${databases.length} database(s)`
    );

    res.status(response.statuscode).json(response);
});