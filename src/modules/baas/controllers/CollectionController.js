import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { CollectionService } from '../services/CollectionService.js';

export const createCollection = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const databaseId = req.params.database_id || req.session?.databaseId;
    const projectId = req.session?.project_id;
    const userId = req.user?.id;

    const collection = await CollectionService.create({ projectId, databaseId, name, userId });

    req.session.collectionId = collection.id;

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
    const projectId = req.session?.project_id;
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
    const databaseId = req.session?.databaseId || req.params.databaseId;
    const projectId = req.session?.project_id;
    const userId = req.user?.id;

    const collections = await CollectionService.listByDatabase({ projectId, databaseId, userId });

    const response = new ApiResponse(
        200,
        {
            database_id: databaseId,
            project_id: projectId,
            total_collections: collections.length,
            collections
        },
        `Retrieved ${collections.length} collection(s)`
    );

    res.status(response.statuscode).json(response);
});