import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { DatabaseService } from '../services/DatabaseService.js';

export const createDatabase = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const projectId = req.params.project_id || req.session?.project_id;
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
    const { id } = req.params;
    const userId = req.user?.id;

    const database = await DatabaseService.delete({ projectId: id, databaseId: id, userId });

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
});

export const listAllDatabases = asyncHandler(async (req, res) => {
    const { project_id } = req.params;
    const userId = req.user?.id;

    const databases = await DatabaseService.listByProject({ projectId: project_id, userId });

    const response = new ApiResponse(
        200,
        {
            project_id,
            total_databases: databases.length,
            databases
        },
        `Retrieved ${databases.length} database(s)`
    );

    res.status(response.statuscode).json(response);
});