import { DatabaseService } from '../../baas/services/DatabaseService.js';
import { Project } from '../models/Project.js';
import { logger } from '../../../shared/utils/Logger.js';

export const createDeleteDatabasesStep = (projectIdStr, ownerId) => ({
    name: 'delete-all-databases',
    execute: async (context) => {
        await DatabaseService.deleteAllForProject({ 
            projectId: projectIdStr, 
            userId: ownerId 
        });
        context.databasesDeleted = true;
    },
    compensate: async (context) => {
        logger.warn('Compensation: databases were deleted, manual recovery may be needed', { 
            projectId: projectIdStr 
        });
    }
});

export const createSoftDeleteProjectStep = (projectMongoId, projectIdStr) => ({
    name: 'soft-delete-project',
    execute: async () => {
        const project = await Project.findById(projectMongoId);
        if (project) {
            project.status = 'deleted';
            await project.save();
        }
    },
    compensate: async () => {
        const proj = await Project.findById(projectMongoId);
        if (proj && proj.status === 'deleted') {
            proj.status = 'active';
            await proj.save();
            logger.info('Compensation: project re-activated', { projectId: projectIdStr });
        }
    }
});