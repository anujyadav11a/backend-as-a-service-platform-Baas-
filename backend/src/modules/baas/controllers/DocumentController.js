import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { DocumentService } from '../services/DocumentService.js';

export const addDocument = asyncHandler(async (req, res) => {
    const { data } = req.body;
    const { collection_id } = req.params;
    const projectId = req.projectId;
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';

    const document = await DocumentService.create({
        collectionId: collection_id,
        projectId,
        data,
        authType,
        project: { project_id: projectId }
    });

    const response = new ApiResponse(
        201,
        {
            id: document.id,
            collection_id: document.collection_id,
            data: JSON.parse(document.data),
            created_at: document.created_at,
            project_id: document.project_id
        },
        'Document added successfully'
    );

    res.status(response.statuscode).json(response);
});

export const getDocuments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { collection_id } = req.params;
    const projectId = req.projectId;
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';

    const result = await DocumentService.list({
        collectionId: collection_id,
        projectId,
        page: parseInt(page),
        limit: parseInt(limit),
        authType,
        project: { project_id: projectId }
    });

    const response = new ApiResponse(
        200,
        {
            documents: result.documents,
            pagination: result.pagination
        },
        'Documents retrieved successfully'
    );

    res.status(response.statuscode).json(response);
});

export const queryDocuments = asyncHandler(async (req, res) => {
    const { filters = [], sort, page = 1, limit = 10 } = req.body;
    const { collection_id } = req.params;
    const projectId = req.projectId;
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';

    const result = await DocumentService.query({
        collectionId: collection_id,
        projectId,
        filters,
        sort,
        page: parseInt(page),
        limit: parseInt(limit),
        authType,
        project: { project_id: projectId }
    });

    const response = new ApiResponse(
        200,
        {
            documents: result.documents,
            pagination: result.pagination
        },
        'Documents queried successfully'
    );

    res.status(response.statuscode).json(response);
});

export const getDocumentById = asyncHandler(async (req, res) => {
    const { document_id, collection_id } = req.params;
    const projectId = req.projectId;
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';

    const document = await DocumentService.getById({
        collectionId: collection_id,
        projectId,
        documentId: document_id,
        authType,
        project: { project_id: projectId }
    });

    const response = new ApiResponse(
        200,
        {
            id: document.id,
            collection_id: document.collection_id,
            data: document.data,
            created_at: document.created_at,
            project_id: document.project_id
        },
        'Document retrieved successfully'
    );

    res.status(response.statuscode).json(response);
});

export const updateDocument = asyncHandler(async (req, res) => {
    const { document_id, collection_id } = req.params;
    const { data } = req.body;
    const projectId = req.projectId;
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';

    const document = await DocumentService.update({
        collectionId: collection_id,
        projectId,
        documentId: document_id,
        data,
        authType,
        project: { project_id: projectId }
    });

    const response = new ApiResponse(
        200,
        {
            id: document.id,
            collection_id: document.collection_id,
            data: JSON.parse(document.data),
            created_at: document.created_at,
            project_id: document.project_id
        },
        'Document updated successfully'
    );

    res.status(response.statuscode).json(response);
});

export const deleteDocument = asyncHandler(async (req, res) => {
    const { document_id, collection_id } = req.params;
    const projectId = req.projectId;
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';

    await DocumentService.delete({
        collectionId: collection_id,
        projectId,
        documentId: document_id,
        authType,
        project: { project_id: projectId }
    });

    const response = new ApiResponse(
        200,
        null,
        'Document deleted successfully'
    );

    res.status(response.statuscode).json(response);
});