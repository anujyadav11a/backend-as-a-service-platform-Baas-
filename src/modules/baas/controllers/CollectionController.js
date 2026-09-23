import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { CollectionService } from '../services/CollectionService.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { ApiError } from '../../../shared/utils/apierror.js';

export const createCollection = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const { database_id } = req.params;
    const projectId = req.projectId;
    const userId = req.user?.id;

    // Verify database belongs to project (defense in depth)
    const database = await DatabaseService.db.findById(database_id);
    if (!database) {
        throw ApiError.notFound('Database not found');
    }
    if (database.project_id !== projectId) {
        throw ApiError.forbidden('Database does not belong to this project');
    }

    const collection = await CollectionService.create({ projectId, databaseId: database_id, name, userId });

    const response = new ApiResponse(
        201,
        {
            id: collection.id,
            database_id: collection.database_id,
            name: collection.name,
            project_id: collection.project_id,
            created_at: collection.created_at
        },
        'Collection created successfully'
    );

    res.status(response.statuscode).json(response);
});

export const deleteCollection = asyncHandler(async (req, res) => {
    const { collection_id } = req.params;
    const projectId = req.projectId;
    const userId = req.user?.id;

    const collection = await CollectionService.delete({ projectId, collectionId: collection_id, userId });

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
});

export const listAllCollections = asyncHandler(async (req, res) => {
    const { database_id } = req.params;
    const projectId = req.projectId;
    const userId = req.user?.id;

    // Verify database belongs to project (defense in depth)
    const database = await DatabaseService.db.findById(database_id);
    if (!database) {
        throw ApiError.notFound('Database not found');
    }
    if (database.project_id !== projectId) {
        throw ApiError.forbidden('Database does not belong to this project');
    }

    const collections = await CollectionService.listByDatabase({ projectId, databaseId: database_id, userId });

    const response = new ApiResponse(
        200,
        {
            database_id,
            project_id: projectId,
            total_collections: collections.length,
            collections
        },
        `Retrieved ${collections.length} collection(s)`
    );

    res.status(response.statuscode).json(response);
});