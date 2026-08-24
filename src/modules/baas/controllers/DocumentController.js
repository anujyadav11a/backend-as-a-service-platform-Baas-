import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { DocumentService } from '../services/DocumentService.js';

function getProjectIdFromRequest(req) {
    if (req.project && (req.project._id || req.project.id)) {
        return req.project._id || req.project.id;
    }
    if (req.headers.project_id) {
        return req.headers.project_id;
    }
    if (req.body?.project_id) {
        return req.body.project_id;
    }
    return null;
}

function getCollectionIdFromRequest(req) {
    if (req.params.collection_id) {
        return req.params.collection_id;
    }
    if (req.body?.collection_id) {
        return req.body.collection_id;
    }
    return null;
}

export const addDocument = asyncHandler(async (req, res) => {
    const { data } = req.body;
    const collectionId = getCollectionIdFromRequest(req);
    const projectId = getProjectIdFromRequest(req);
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';
    const project = req.project;

    const document = await DocumentService.create({
        collectionId,
        projectId,
        data,
        authType,
        project
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
    const collectionId = getCollectionIdFromRequest(req);
    const projectId = getProjectIdFromRequest(req);
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';
    const project = req.project;

    const result = await DocumentService.list({
        collectionId,
        projectId,
        page: parseInt(page),
        limit: parseInt(limit),
        authType,
        project
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
    const collectionId = getCollectionIdFromRequest(req);
    const projectId = getProjectIdFromRequest(req);
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';
    const project = req.project;

    const result = await DocumentService.query({
        collectionId,
        projectId,
        filters,
        sort,
        page: parseInt(page),
        limit: parseInt(limit),
        authType,
        project
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
    const { document_id } = req.params;
    const collectionId = getCollectionIdFromRequest(req);
    const projectId = getProjectIdFromRequest(req);
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';
    const project = req.project;

    const document = await DocumentService.getById({
        collectionId,
        projectId,
        documentId: document_id,
        authType,
        project
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
    const { document_id } = req.params;
    const { data } = req.body;
    const collectionId = getCollectionIdFromRequest(req);
    const projectId = getProjectIdFromRequest(req);
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';
    const project = req.project;

    const document = await DocumentService.update({
        collectionId,
        projectId,
        documentId: document_id,
        data,
        authType,
        project
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
    const { document_id } = req.params;
    const collectionId = getCollectionIdFromRequest(req);
    const projectId = getProjectIdFromRequest(req);
    const authType = req.apiKey ? 'API_KEY' : 'SESSION';
    const project = req.project;

    await DocumentService.delete({
        collectionId,
        projectId,
        documentId: document_id,
        authType,
        project
    });

    const response = new ApiResponse(
        200,
        null,
        'Document deleted successfully'
    );

    res.status(response.statuscode).json(response);
});