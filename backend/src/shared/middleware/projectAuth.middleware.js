import { Project } from '../../modules/project/models/Project.js';
import { ApiError } from '../utils/apierror.js';
import { asyncHandler } from '../utils/asynchandler.js';

export const requireProjectAccess = asyncHandler(async (req, res, next) => {
    const projectId = req.params.project_id;

    console.log('🔎 requireProjectAccess → project_id from URL:', projectId);
    console.log('🔎 requireProjectAccess → authenticated user:', req.user?.id);

    if (!projectId) {
        throw ApiError.badRequest('Project ID is required');
    }

    const userId = req.user?.id;

    if (!userId) {
        throw ApiError.unauthorized('Authentication required');
    }

    const project = await Project.findOne({
        project_id: projectId,
        owner_id: userId,
        status: 'active'
    });

    console.log('🔎 requireProjectAccess → project found:', !!project);

    if (!project) {
        throw ApiError.forbidden('No access to this project');
    }

    req.projectId = projectId;
    req.project = project;
    next();
});