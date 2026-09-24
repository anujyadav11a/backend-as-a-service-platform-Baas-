import { Router } from "express";
import { deleteDatabase, createDatabase, listAllDatabases } from "../controllers/DatabaseController.js";
import { createCollection, listAllCollections } from "../controllers/CollectionController.js";
import { authMiddleware } from "../../../shared/middleware/auth.middleware.js";
import { requireProjectAccess } from "../../../shared/middleware/index.js";
import { validate } from "../../../shared/middleware/validate.js";
import { deleteDatabaseSchema, createDatabaseSchema } from "../../../shared/validation/database.js";
import { createCollectionSchema, listCollectionsSchema } from "../../../shared/validation/collection.js";

const databaseRouter = new Router();

databaseRouter.route("/projects/:project_id/databases")
    .post(authMiddleware, requireProjectAccess, validate(createDatabaseSchema), createDatabase)
    .get(authMiddleware, requireProjectAccess, listAllDatabases);

databaseRouter.route("/projects/:project_id/databases/:database_id")
    .delete(authMiddleware, requireProjectAccess, validate(deleteDatabaseSchema), deleteDatabase);

databaseRouter.route("/projects/:project_id/databases/:database_id/collections")
    .post(authMiddleware, requireProjectAccess, validate(createCollectionSchema), createCollection)
    .get(authMiddleware, requireProjectAccess, validate(listCollectionsSchema), listAllCollections);

export default databaseRouter;