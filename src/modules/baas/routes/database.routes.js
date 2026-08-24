import { Router } from "express";
import { deleteDatabase } from "../controllers/DatabaseController.js";
import { createCollection, listAllCollections } from "../controllers/CollectionController.js";
import { authMiddleware } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.js";
import { deleteDatabaseSchema } from "../../../shared/validation/database.js";
import { createCollectionSchema, listCollectionsSchema } from "../../../shared/validation/collection.js";

const databaseRouter = new Router();

databaseRouter.route("/deleteDatabase/:database_id")
    .delete(authMiddleware, validate(deleteDatabaseSchema), deleteDatabase);

databaseRouter.route("/:database_id/createCollection")
    .post(authMiddleware, validate(createCollectionSchema), createCollection);

databaseRouter.route("/:database_id/listCollections")
    .get(authMiddleware, validate(listCollectionsSchema), listAllCollections);

export default databaseRouter;