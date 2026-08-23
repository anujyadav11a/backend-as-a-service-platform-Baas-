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
import { validate } from '../middleware/validate.js';
import { 
    createProjectSchema, 
    updateProjectSchema, 
    getProjectSchema, 
    searchProjectsSchema, 
    generateApiKeySchema, 
    deleteProjectSchema 
} from '../validation/project.js';
import { createDatabaseSchema, listDatabasesSchema } from '../validation/database.js';

const projectRouter =new Router();

projectRouter.route("/create").post(authMiddleware, validate(createProjectSchema), createProject);
projectRouter.route("/sdkdetails").post(authMiddleware, cacheMiddleware("sdk-details"), getProjectForSDK);
projectRouter.route("/list").get(authMiddleware, cacheMiddleware("project-list"), getUserProjects);
projectRouter.route("/search").get(authMiddleware, validate(searchProjectsSchema), searchProjects);
projectRouter.route("/:project_id").get(authMiddleware, validate(getProjectSchema), cacheMiddleware("project"), getProject);
projectRouter.route("/:projectId").put(authMiddleware, validate(updateProjectSchema), updateProject);
projectRouter.route("/:projectId").delete(authMiddleware, validate(deleteProjectSchema), deleteProject);
projectRouter.route("/:project_id/createdatabase").post(authMiddleware, validate(createDatabaseSchema), createDatabase);
projectRouter.route("/:project_id/listdatabases").get(authMiddleware, validate(listDatabasesSchema), cacheMiddleware("database-list"), listAllDatabases);

export default projectRouter;