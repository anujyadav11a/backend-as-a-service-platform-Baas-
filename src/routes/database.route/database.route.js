import { Router } from "express";
import {createDatabase} from "../../controllers/database.controller/database.controller.js"
import {createCollection} from "../../controllers/database.controller/collection.controller.js";

const databaseRouter=new Router();
databaseRouter.route("/creatDatebase").post(createDatabase);
databaseRouter.route("/createCollection").post(createCollection);

export default databaseRouter;
