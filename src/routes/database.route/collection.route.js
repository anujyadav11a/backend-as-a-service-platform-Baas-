import { Router } from "express";
import { deleteCollection } from "../../controllers/database.controller/collection.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { apiKeyAuth } from "../../middleware/apiKey.middleware.js";
import { addColumn } from "../../controllers/database.controller/attribute.controller.js";
import {
    addDocument,
    getDocuments,
    queryDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} from "../../controllers/database.controller/document.controller.js";

const collectionRouter = new Router();

// Collection management routes (session-based auth)
collectionRouter.route("/deleteCollection/:collection_id").delete(authMiddleware, deleteCollection);
collectionRouter.route("/:collection_id/addColumn").post(authMiddleware, addColumn);

// Document CRUD routes with API key authentication
// Create a new document
collectionRouter.route("/:collection_id/documents").post(apiKeyAuth, addDocument);

// Get all documents from a collection with pagination
collectionRouter.route("/:collection_id/documents").get(apiKeyAuth, getDocuments);

// Query documents with filters (server-side filtering)
collectionRouter.route("/:collection_id/documents/query").post(apiKeyAuth, queryDocuments);

// Get a single document by ID
collectionRouter.route("/:collection_id/documents/:document_id").get(apiKeyAuth, getDocumentById);

// Update a document by ID
collectionRouter.route("/:collection_id/documents/:document_id").put(apiKeyAuth, updateDocument);

// Delete a document by ID
collectionRouter.route("/:collection_id/documents/:document_id").delete(apiKeyAuth, deleteDocument);

export default collectionRouter;