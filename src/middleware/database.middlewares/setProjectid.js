import { Project } from "../../models/Database/project.model.js";
import { ApiError } from "../../utils/apierror.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/Logger.js";

/**
 * Middleware to set project_id in session based on user ID
 * Gets the userId from the session/request, finds the associated project,
 * and adds the project_id to the session for future API calls
 */
export const setProjectIdMiddleware = asyncHandler(async (req, res, next) => {
    try {
        // Get userId from authenticated user
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            throw ApiError.unauthorized("User ID not found in session");
        }

        logger.info('Setting project ID for user', { userId });

        // Find the first project owned by this user
        const project = await Project.findOne({ owner_id: userId, status: 'active' });

        if (!project) {
            throw ApiError.notFound("No active project found for this user");
        }

        // Add project_id to session for future API calls
        req.session.projectId = project._id;//mongodb id
        req.session.project_id = project.project_id;// custom project_id field

        logger.info('Project ID set in session', { 
            userId, 
            projectId: project._id,
            project_id: project.project_id 
        });

        // Attach project to request for next middleware/route
        req.project = project;

        next();
    } catch (error) {
        logger.error('Error setting project ID', { 
            error: error.message,
            userId: req.user?._id || req.user?.id 
        });
        
        throw error;
    }
});
