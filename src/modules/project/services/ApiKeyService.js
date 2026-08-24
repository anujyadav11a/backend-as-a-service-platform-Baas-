import { Project } from '../models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { ProjectEvents } from '../../../shared/events/projectEvents.js';

export class ApiKeyService {
    static async generate(projectSlug, { name, permissions = ['read'], environment = 'development' }, ownerId) {
        logger.info('Generating API key', { projectSlug, name, environment, ownerId });

        const project = await Project.findBySlug(projectSlug);
        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        if (project.owner_id.toString() !== ownerId.toString()) {
            throw ApiError.forbidden('Insufficient permissions to manage API keys');
        }

        const apiKeyData = project.generateApiKey(name, permissions, environment, ownerId);
        await project.save();

        logger.info('API key generated successfully', { 
            projectId: project._id, 
            keyId: apiKeyData.key_id,
            ownerId 
        });

        // Emit domain event
        eventBus.emit(ProjectEvents.API_KEY_GENERATED, {
            projectId: project._id,
            keyId: apiKeyData.key_id,
            name: apiKeyData.name,
            permissions: apiKeyData.permissions,
            environment: apiKeyData.environment
        });

        return {
            key_id: apiKeyData.key_id,
            api_key: apiKeyData.api_key,
            name: apiKeyData.name,
            permissions: apiKeyData.permissions,
            environment: apiKeyData.environment
        };
    }

    static async list(projectSlug, ownerId) {
        const project = await Project.findBySlug(projectSlug);
        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        if (project.owner_id.toString() !== ownerId.toString()) {
            throw ApiError.forbidden('Insufficient permissions');
        }

        return project.api_keys || [];
    }

    static async revoke(projectSlug, keyId, ownerId) {
        const project = await Project.findBySlug(projectSlug);
        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        if (project.owner_id.toString() !== ownerId.toString()) {
            throw ApiError.forbidden('Insufficient permissions');
        }

        const keyIndex = project.api_keys?.findIndex(k => k.key_id === keyId);
        if (keyIndex === undefined || keyIndex === -1) {
            throw ApiError.notFound('API key not found');
        }

        project.api_keys[keyIndex].revoked = true;
        project.api_keys[keyIndex].revoked_at = new Date();
        await project.save();

        logger.info('API key revoked', { projectId: project._id, keyId, ownerId });

        // Emit domain event
        eventBus.emit(ProjectEvents.API_KEY_REVOKED, {
            projectId: project._id,
            keyId
        });

        return { success: true };
    }
}