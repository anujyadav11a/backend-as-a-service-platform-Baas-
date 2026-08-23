import { Router } from "express";
import {deleteDatabase} from "../../controllers/database.controller/database.controller.js"
import { createCollection,listAllCollections } from "../../controllers/database.controller/collection.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { deleteDatabaseSchema } from "../../validation/database.js";
import { createCollectionSchema, listCollectionsSchema } from "../../validation/collection.js";

const databaseRouter=new Router();

databaseRouter.route("/deleteDatabase/:database_id").delete(authMiddleware, validate(deleteDatabaseSchema), deleteDatabase);
databaseRouter.route("/:database_id/createCollection").post(authMiddleware, validate(createCollectionSchema), createCollection);
databaseRouter.route("/:database_id/listCollections").get(authMiddleware, validate(listCollectionsSchema), listAllCollections);

export default databaseRouter;