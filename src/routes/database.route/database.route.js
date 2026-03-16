import { Router } from "express";
import {deleteDatabase} from "../../controllers/database.controller/database.controller.js"
import { createCollection,listAllCollections } from "../../controllers/database.controller/collection.controller.js";


import { authMiddleware } from "../../middleware/auth.middleware.js";

const databaseRouter=new Router();

databaseRouter.route("/deleteDatabase/:database_id").delete(authMiddleware, deleteDatabase);
databaseRouter.route("/:database_id/createCollection").post(authMiddleware, createCollection);
databaseRouter.route("/:database_id/listCollections").get(authMiddleware, listAllCollections);





export default databaseRouter;
