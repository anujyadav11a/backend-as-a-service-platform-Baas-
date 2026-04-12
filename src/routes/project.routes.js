import Router from 'express';
import {
    createProject,
    getUserProjects,
    getProjectForSDK,
    getProject,
    updateProject,
    searchProjects,
    deleteProject
} from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createDatabase,listAllDatabases } from '../controllers/database.controller/database.controller.js';
import { cacheMiddleware } from '../middleware/redisCache.js';
   
const projectRouter =new Router();

projectRouter.route("/create").post(authMiddleware,createProject)
projectRouter.route("/sdkdetails").post(authMiddleware,cacheMiddleware("sdk-details"), getProjectForSDK)
projectRouter.route("/list").get(authMiddleware,cacheMiddleware("project-list"), getUserProjects);
projectRouter.route("/search").get(authMiddleware, searchProjects);
projectRouter.route("/:project_id").get(authMiddleware, cacheMiddleware("project"), getProject);
projectRouter.route("/:projectId").put(authMiddleware, updateProject);
projectRouter.route("/:projectId").delete(authMiddleware, deleteProject);
projectRouter.route("/:project_id/createdatabase").post(authMiddleware,  createDatabase);
projectRouter.route("/:project_id/listdatabases").get(authMiddleware, cacheMiddleware("database-list"), listAllDatabases);




export default projectRouter;