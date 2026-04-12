import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { ValidationHelper } from "../utils/validate.js";
import { logger } from "../utils/Logger.js";
import { Project } from "../models/Database/project.model.js";
import { invalidateCache, CacheKeys } from "../utils/cacheInvalidation.js";

/**
 * Create a new project
 */
const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;

    logger.info('Creating new project', { userId, name });

    // Validate required fields
    ValidationHelper.validateRequired(['name'], req.body);
    ValidationHelper.validateStringLength(name, 'name', 2, 100);

    if (description) {
        ValidationHelper.validateStringLength(description, 'description', 0, 500);
    }

    // Sanitize inputs
    const sanitizedName = ValidationHelper.sanitizeInput(name);
    const sanitizedDescription = description ? ValidationHelper.sanitizeInput(description) : '';

    // Check for duplicate project name for this user
    const existingProject = await Project.findByName(userId, sanitizedName);
    if (existingProject) {
        throw ApiError.conflict('A project with this name already exists');
    }

    // Check project limit (max 5 projects per user for now)
    const userProjects = await Project.findByOwner(userId);
    if (userProjects.length >= 5) {
        throw ApiError.forbidden('Project limit reached. Maximum 5 projects allowed.');
    }

    // Create project
    const project = new Project({
        name: sanitizedName,
        description: sanitizedDescription,
        owner_id: userId
    });

    await project.save();

    //set teh projectid in the session for future API calls
    req.session.projectId = project._id;

    // Invalidate project list cache for this user
    await invalidateCache([
        CacheKeys.projectList(userId)
    ]);

    logger.info('Project created successfully', { 
        projectId: project._id, 
        project_id: project.project_id,
        userId 
    });
      
    const response = new ApiResponse(
        201,
        {
            id: project._id,
            project_id: project.project_id,
            name: project.name,
            description: project.description,
            api_key: project.api_key,
            api_endpoint: project.sdk_config.api_endpoint,
            status: project.status,
            created_at: project.createdAt
        },
        'Project created successfully'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Get user's projects
 */
const getUserProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    logger.info('Fetching user projects', { userId });

    const projects = await Project.findByOwner(userId)
        .select('name description project_id api_key status usage_stats createdAt updatedAt')
        .sort({ updatedAt: -1 });

    const response = new ApiResponse(
        200,
        {
            projects: projects.map(project => ({
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
            }))
        },
        'Projects retrieved successfully'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Get project by ID
 */
const getProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    logger.info('Fetching project details', { projectId, userId });

    const project = await Project.findOne({
        $or: [
            { _id: projectId },
            { project_id: projectId }
        ],
        owner_id: userId,
        status: { $ne: 'deleted' }
    });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    const response = new ApiResponse(
        200,
        {
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
        },
        'Project retrieved successfully'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Update project
 */
const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    logger.info('Updating project', { projectId, userId });

    const project = await Project.findOne({
        $or: [
            { _id: projectId },
            { project_id: projectId }
        ],
        owner_id: userId,
        status: { $ne: 'deleted' }
    });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    // Validate and update fields
    if (name) {
        ValidationHelper.validateStringLength(name, 'name', 2, 100);
        const sanitizedName = ValidationHelper.sanitizeInput(name);
        
        // Check if name is being changed and if new name already exists
        if (sanitizedName !== project.name) {
            const existingProject = await Project.findByName(userId, sanitizedName);
            if (existingProject) {
                throw ApiError.conflict('A project with this name already exists');
            }
            project.name = sanitizedName;
        }
    }

    if (description !== undefined) {
        if (description) {
            ValidationHelper.validateStringLength(description, 'description', 0, 500);
            project.description = ValidationHelper.sanitizeInput(description);
        } else {
            project.description = '';
        }
    }

    await project.save();

    // Invalidate related caches
    await invalidateCache([
        CacheKeys.projectList(userId),
        CacheKeys.project(projectId),
        CacheKeys.sdkDetails(userId)
    ]);

    logger.info('Project updated successfully', { projectId: project._id, userId });

    const response = new ApiResponse(
        200,
        {
            id: project._id,
            project_id: project.project_id,
            name: project.name,
            description: project.description,
            api_key: project.api_key,
            status: project.status,
            updated_at: project.updatedAt
        },
        'Project updated successfully'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Generate API key for project
 */
const generateApiKey = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { name, permissions = ['read'], environment = 'development' } = req.body;
    const userId = req.user.id;

    logger.info('Generating API key', { slug, name, environment, userId });

    ValidationHelper.validateRequired(['name'], req.body);

    const project = await Project.findBySlug(slug);
    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    if (!hasProjectPermission(project, userId, 'manage_api_keys')) {
        throw ApiError.forbidden('Insufficient permissions to manage API keys');
    }

    const apiKeyData = project.generateApiKey(name, permissions, environment, userId);
    await project.save();

    logger.info('API key generated successfully', { 
        projectId: project._id, 
        keyId: apiKeyData.key_id,
        userId 
    });

    const response = new ApiResponse(
        201,
        {
            key_id: apiKeyData.key_id,
            api_key: apiKeyData.api_key,
            name: apiKeyData.name,
            permissions: apiKeyData.permissions,
            environment: apiKeyData.environment
        },
        'API key generated successfully'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Get project details for SDK configuration
 */
const getProjectForSDK = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    logger.info('Fetching project for SDK config', { projectId, userId });

    const project = await Project.findOne({
        $or: [
            { _id: projectId },
            { project_id: projectId }
        ],
        owner_id: userId,
        status: 'active'
    }).select('project_id api_key name status');

    if (!project) {
        throw ApiError.notFound('Project not found or inactive');
    }

    const response = new ApiResponse(
        200,
        {
            project_id: project.project_id,
            api_key: project.api_key,
            api_endpoint: `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/v1/${project.project_id}`,
            project_name: project.name
        },
        'Project SDK configuration retrieved'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Search projects by name
 */
const searchProjects = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const userId = req.user.id;

    logger.info('Searching projects', { userId, query });

    if (!query || query.trim().length === 0) {
        throw ApiError.badRequest('Search query is required');
    }

    const sanitizedQuery = ValidationHelper.sanitizeInput(query.trim());
    
    const projects = await Project.searchByName(userId, sanitizedQuery);

    logger.info('Projects search completed', { userId, resultsCount: projects.length });

    const response = new ApiResponse(
        200,
        {
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
        },
        'Projects search completed'
    );

    res.status(response.statuscode).json(response);
});

/**
 * Delete project (soft delete)
 */
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    logger.info('Deleting project', { projectId, userId });

    const project = await Project.findOne({
        $or: [
            { _id: projectId },
            { project_id: projectId }
        ],
        owner_id: userId,
        status: { $ne: 'deleted' }
    });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    // Soft delete - set status to deleted
    project.status = 'deleted';
    await project.save();

    // Clear project from session if it matches
    if (req.session.projectId === project._id.toString()) {
        delete req.session.projectId;
    }

    // Invalidate all related caches
    await invalidateCache([
        CacheKeys.projectList(userId),
        CacheKeys.project(projectId),
        CacheKeys.sdkDetails(userId),
        CacheKeys.databaseList(project.project_id)
    ]);

    logger.info('Project deleted successfully', { projectId: project._id, userId });

    const response = new ApiResponse(
        200,
        {
            id: project._id,
            project_id: project.project_id,
            name: project.name
        },
        'Project deleted successfully'
    );

    res.status(response.statuscode).json(response);
});

export {
    createProject,
    getUserProjects,
    getProject,
    generateApiKey,
    updateProject,
    getProjectForSDK,
    searchProjects,
    deleteProject
};