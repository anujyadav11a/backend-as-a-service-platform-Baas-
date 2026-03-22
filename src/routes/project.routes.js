import Router from 'express';
import {
    createProject,
   
    getProjectForSDK
} from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createDatabase,listAllDatabases } from '../controllers/database.controller/database.controller.js';


     
const projectRouter =new Router();

projectRouter.route("/create").post(authMiddleware,createProject)
projectRouter.route("/sdkdetails").post(getProjectForSDK)







projectRouter.route("/:project_id/createdatabase").post(authMiddleware,  createDatabase);
projectRouter.route("/:project_id/listdatabases").get(authMiddleware, listAllDatabases);




export default projectRouter;