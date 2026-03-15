import { Router } from "express";
import {createDatabase} from "../../controllers/database.controller/database.controller.js"
import {createCollection} from "../../controllers/database.controller/collection.controller.js";
import {tenantAuthMiddleware} from "../../middleware/tenantAuth.middleware.js"; 

const databaseRouter=new Router();
databaseRouter.route("/createDatabase").post(tenantAuthMiddleware, createDatabase);
databaseRouter.route("/createCollection").post(tenantAuthMiddleware, createCollection);

export default databaseRouter;
