import { Router } from "express";
import { deleteCollection } from "../controllers/CollectionController.js";
import { addColumn } from "../controllers/AttributeController.js";
import {
    addDocument,
    getDocuments,
    queryDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} from "../controllers/DocumentController.js";
import { authMiddleware } from "../../../shared/middleware/auth.middleware.js";
import { apiKeyAuth } from "../../../shared/middleware/apiKey.middleware.js";
import { validate } from "../../../shared/middleware/validate.js";
import { deleteCollectionSchema } from "../../../shared/validation/collection.js";
import { addColumnSchema } from "../../../shared/validation/attribute.js";
import {
    addDocumentSchema,
    getDocumentsSchema,
    queryDocumentsSchema,
    getDocumentByIdSchema,
    updateDocumentSchema,
    deleteDocumentSchema
} from "../../../shared/validation/document.js";

const collectionRouter = new Router();

// Collection management routes (session-based auth)
collectionRouter.route("/deleteCollection/:collection_id")
    .delete(authMiddleware, validate(deleteCollectionSchema), deleteCollection);

collectionRouter.route("/:collection_id/addColumn")
    .post(authMiddleware, validate(addColumnSchema), addColumn);

// Document CRUD routes with API key authentication
// Create a new document
collectionRouter.route("/:collection_id/documents")
    .post(apiKeyAuth, validate(addDocumentSchema), addDocument);

// Get all documents from a collection with pagination
collectionRouter.route("/:collection_id/documents")
    .get(apiKeyAuth, validate(getDocumentsSchema), getDocuments);

// Query documents with filters (server-side filtering)
collectionRouter.route("/:collection_id/documents/query")
    .post(apiKeyAuth, validate(queryDocumentsSchema), queryDocuments);

// Get a single document by ID
collectionRouter.route("/:collection_id/documents/:document_id")
    .get(apiKeyAuth, validate(getDocumentByIdSchema), getDocumentById);

// Update a document by ID
collectionRouter.route("/:collection_id/documents/:document_id")
    .put(apiKeyAuth, validate(updateDocumentSchema), updateDocument);

// Delete a document by ID
collectionRouter.route("/:collection_id/documents/:document_id")
    .delete(apiKeyAuth, validate(deleteDocumentSchema), deleteDocument);

export default collectionRouter;