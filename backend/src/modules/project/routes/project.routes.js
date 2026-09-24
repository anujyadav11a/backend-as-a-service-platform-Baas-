import express from 'express';
import { ProjectController } from '../controllers/ProjectController.js';
import { ApiKeyController } from '../controllers/ApiKeyController.js';
import { authMiddleware } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.js';
import { cacheMiddleware } from '../../../shared/middleware/redisCache.js';
import { 
    createProjectSchema, 
    updateProjectSchema, 
    getProjectSchema, 
    searchProjectsSchema,
    generateApiKeySchema,
    deleteProjectSchema,
    updateProjectConfigSchema
} from '../../../shared/validation/project.js';

const router = express.Router();+

// Project CRUD routes
router.post('/create', authMiddleware, validate(createProjectSchema), ProjectController.create);
router.get('/list', authMiddleware, cacheMiddleware('project-list'), ProjectController.list);
router.get('/search', authMiddleware, validate(searchProjectsSchema), ProjectController.search);
router.get('/:projectId', authMiddleware, validate(getProjectSchema), cacheMiddleware('project'), ProjectController.get);
router.put('/:projectId', authMiddleware, validate(updateProjectSchema), ProjectController.update);
router.delete('/:projectId', authMiddleware, validate(deleteProjectSchema), ProjectController.delete);
router.get('/:projectId/sdk', authMiddleware, cacheMiddleware('sdk-details'), ProjectController.getSDKConfig);

// API Key routes
router.post('/:projectId/apikeys', authMiddleware, validate(generateApiKeySchema), ApiKeyController.generate);
router.get('/:projectId/apikeys', authMiddleware, ApiKeyController.list);
router.delete('/:projectId/apikeys/:keyId', authMiddleware, ApiKeyController.revoke);

// Project Config routes
router.get('/:projectId/config', authMiddleware, ProjectController.getConfig);
router.patch('/:projectId/config', authMiddleware, validate(updateProjectConfigSchema), ProjectController.updateConfig);

export default router;