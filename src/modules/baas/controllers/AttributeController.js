import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { AttributeService } from '../services/AttributeService.js';

export const addColumn = asyncHandler(async (req, res) => {
    const { name, type, required = false } = req.body;
    const { collection_id } = req.params;
    const projectId = req.session?.project_id;
    const databaseId = req.session?.databaseId;
    const userId = req.user?.id;

    const attribute = await AttributeService.create({
        projectId,
        collectionId: collection_id,
        databaseId,
        name,
        type,
        required,
        userId
    });

    const response = new ApiResponse(
        201,
        {
            id: attribute.id,
            collection_id: attribute.collection_id,
            name: attribute.name,
            type: attribute.type,
            required: Boolean(attribute.required),
            project_id: attribute.project_id
        },
        'Column added successfully'
    );

    res.status(response.statuscode).json(response);
});

export const listAttributes = asyncHandler(async (req, res) => {
    const { collection_id } = req.params;
    const projectId = req.session?.project_id;
    const userId = req.user?.id;

    const attributes = await AttributeService.listByCollection({
        projectId,
        collectionId: collection_id,
        userId
    });

    const response = new ApiResponse(
        200,
        {
            attributes,
            count: attributes.length
        },
        'Attributes fetched successfully'
    );

    res.status(response.statuscode).json(response);
});

export const updateAttribute = asyncHandler(async (req, res) => {
    const { attribute_id } = req.params;
    const { name, type, required } = req.body;
    const projectId = req.session?.project_id;
    const collectionId = req.params.collection_id;
    const userId = req.user?.id;

    const attribute = await AttributeService.update({
        projectId,
        collectionId,
        attributeId: attribute_id,
        name,
        type,
        required,
        userId
    });

    const response = new ApiResponse(
        200,
        {
            id: attribute.id,
            collection_id: attribute.collection_id,
            database_id: attribute.database_id,
            name: attribute.name,
            type: attribute.type,
            required: Boolean(attribute.required),
            created_at: attribute.created_at,
            updated_at: attribute.updated_at
        },
        'Attribute updated successfully'
    );

    res.status(response.statuscode).json(response);
});

export const deleteAttribute = asyncHandler(async (req, res) => {
    const { attribute_id } = req.params;
    const { confirm } = req.body;
    const projectId = req.session?.project_id;
    const collectionId = req.params.collection_id;
    const userId = req.user?.id;

    if (!confirm) {
        throw new Error('Please confirm attribute deletion by setting confirm: true in the request body');
    }

    const result = await AttributeService.delete({
        projectId,
        collectionId,
        attributeId: attribute_id,
        userId
    });

    const response = new ApiResponse(
        200,
        {
            id: result.id,
            name: result.name,
            deleted: true,
            documents_affected: result.documents_affected
        },
        'Attribute deleted successfully'
    );

    res.status(response.statuscode).json(response);
});