import { Project } from '../models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { invalidateCache } from '../../../shared/utils/cacheInvalidation.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { ProjectEvents } from '../../../shared/events/projectEvents.js';

export class ProjectService {
    static async create({ name, description, ownerId }) {
        logger.info('Creating new project', { ownerId, name });

        const existingProject = await Project.findByName(ownerId, name);
        if (existingProject) {
            throw ApiError.conflict('A project with this name already exists');
        }

        const userProjects = await Project.findByOwner(ownerId);
        if (userProjects.length >= 5) {
            throw ApiError.forbidden('Project limit reached. Maximum 5 projects allowed.');
        }

        const MAX_ATTEMPTS = 5;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                const project = new Project({
                    name,
                    description: description || '',
                    owner_id: ownerId
                });

                await project.save();

                // Invalidate project list cache for this user
                await invalidateCache(['project-list:' + ownerId]);

                logger.info('Project created successfully', {
                    projectId: project._id,
                    project_id: project.project_id,
                    ownerId
                });

                // Emit domain event
                eventBus.emit(ProjectEvents.PROJECT_CREATED, {
                    projectId: project._id,
                    project_id: project.project_id,
                    name: project.name,
                    ownerId
                });

                return project;
            } catch (err) {
                const isProjectIdDup = err.code === 11000 && err.keyValue?.project_id;
                if (isProjectIdDup && attempt < MAX_ATTEMPTS) {
                    logger.warn('project_id collision, retrying', { attempt, projectId: err.keyValue.project_id });
                    continue;
                }
                throw err;
            }
        }

        throw ApiError.conflict('Unable to allocate unique project_id');
    }

    static async listByOwner(ownerId) {
        logger.info('Fetching user projects', { ownerId });

        const projects = await Project.findByOwner(ownerId)
            .select('name description project_id api_key status usage_stats createdAt updatedAt')
            .sort({ updatedAt: -1 });

        return projects.map(project => ({
            id: project._id,
            project_id: project.project_id,
            name: project.name,
            description: project.description,
            api_key: project.api_key,
            api_endpoint: `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/${project.project_id}`,
            status: project.status,
            usage: {
                api_requests: project.usage_stats.api_requests_count,
                storage_mb: project.usage_stats.storage_used_mb
            },
            created_at: project.createdAt,
            updated_at: project.updatedAt
        }));
    }

    static async getById(projectId, ownerId) {
        logger.info('Fetching project details', { projectId, ownerId });

        const project = await Project.findOne({
            $or: [
                { _id: projectId },
                { project_id: projectId }
            ],
            owner_id: ownerId,
            status: { $ne: 'deleted' }
        });

        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        return {
            id: project._id,
            project_id: project.project_id,
            name: project.name,
            description: project.description,
            api_key: project.api_key,
            api_endpoint: project.sdk_config.api_endpoint,
            status: project.status,
            config: project.config,
            usage: {
                api_requests: project.usage_stats.api_requests_count,
                storage_mb: project.usage_stats.storage_used_mb
            },
            created_at: project.createdAt,
            updated_at: project.updatedAt
        };
    }

    static async update(projectId, ownerId, { name, description }) {
        logger.info('Updating project', { projectId, ownerId });

        const project = await Project.findOne({
            $or: [
                { _id: projectId },
                { project_id: projectId }
            ],
            owner_id: ownerId,
            status: { $ne: 'deleted' }
        });

        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        if (name) {
            const existingProject = await Project.findByName(ownerId, name);
            if (existingProject && existingProject._id.toString() !== project._id.toString()) {
                throw ApiError.conflict('A project with this name already exists');
            }
            project.name = name;
        }

        if (description !== undefined) {
            project.description = description || '';
        }

        await project.save();

        // Invalidate related caches
        await invalidateCache([
            'project-list:' + ownerId,
            'project:' + projectId,
            'sdk-details:' + ownerId
        ]);

        logger.info('Project updated successfully', { projectId: project._id, ownerId });

        // Emit domain event
        const changedFields = {};
        if (name !== undefined) changedFields.name = name;
        if (description !== undefined) changedFields.description = description;
        eventBus.emit(ProjectEvents.PROJECT_UPDATED, {
            projectId: project._id,
            project_id: project.project_id,
            changedFields
        });

        return {
            id: project._id,
            project_id: project.project_id,
            name: project.name,
            description: project.description,
            api_key: project.api_key,
            status: project.status,
            updated_at: project.updatedAt
        };
    }

    static async delete(projectId, ownerId) {
        logger.info('Deleting project', { projectId, ownerId });

        const project = await Project.findOne({
            $or: [
                { _id: projectId },
                { project_id: projectId }
            ],
            owner_id: ownerId,
            status: { $ne: 'deleted' }
        });

        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        project.status = 'deleted';
        await project.save();

        // Invalidate all related caches
        await invalidateCache([
            'project-list:' + ownerId,
            'project:' + projectId,
            'sdk-details:' + ownerId,
            'database-list:' + project.project_id
        ]);

        logger.info('Project deleted successfully', { projectId: project._id, ownerId });

        // Emit domain event
        eventBus.emit(ProjectEvents.PROJECT_DELETED, {
            projectId: project._id,
            project_id: project.project_id,
            ownerId
        });

        return {
            id: project._id,
            project_id: project.project_id,
            name: project.name
        };
    }

    static async search(ownerId, query) {
        logger.info('Searching projects', { ownerId, query });

        if (!query || query.trim().length === 0) {
            throw ApiError.badRequest('Search query is required');
        }

        const sanitizedQuery = query.trim();
        const projects = await Project.searchByName(ownerId, sanitizedQuery);

        return {
            query: sanitizedQuery,
            count: projects.length,
            projects: projects.map(project => ({
                id: project._id,
                project_id: project.project_id,
                name: project.name,
                description: project.description,
                api_key: project.api_key,
                status: project.status,
                created_at: project.createdAt,
                updated_at: project.updatedAt
            }))
        };
    }

    static async getSDKConfig(projectId, ownerId) {
        logger.info('Fetching project for SDK config', { projectId, ownerId });

        const project = await Project.findOne({
            $or: [
                { _id: projectId },
                { project_id: projectId }
            ],
            owner_id: ownerId,
            status: 'active'
        }).select('project_id api_key name status');

        if (!project) {
            throw ApiError.notFound('Project not found or inactive');
        }

        return {
            project_id: project.project_id,
            api_key: project.api_key,
            api_endpoint: `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/${project.project_id}`,
            project_name: project.name
        };
    }
}