import { ProjectService } from '../services/ProjectService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';
import { validate } from '../../../shared/middleware/validate.js';
import { updateProjectConfigSchema } from '../../../shared/validation/project.js';

export class ProjectController {
    static async create(req, res) {
        const { name, description } = req.body;
        const ownerId = req.user.id;

        const project = await ProjectService.create({ name, description, ownerId });

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
    }

    static async list(req, res) {
        const ownerId = req.user.id;
        const fields = req.query.fields;
        const projects = await ProjectService.listByOwner(ownerId, fields);

        const response = new ApiResponse(
            200,
            { projects },
            'Projects retrieved successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async get(req, res) {
        const { projectId } = req.params;
        const ownerId = req.user.id;

        const project = await ProjectService.getById(projectId, ownerId);

        const response = new ApiResponse(
            200,
            project,
            'Project retrieved successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async update(req, res) {
        const { projectId } = req.params;
        const { name, description } = req.body;
        const ownerId = req.user.id;

        const project = await ProjectService.update(projectId, ownerId, { name, description });

        const response = new ApiResponse(
            200,
            project,
            'Project updated successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async delete(req, res) {
        const { projectId } = req.params;
        const ownerId = req.user.id;

        const project = await ProjectService.delete(projectId, ownerId);

        const response = new ApiResponse(
            200,
            project,
            'Project deleted successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async search(req, res) {
        const { query } = req.query;
        const ownerId = req.user.id;

        const result = await ProjectService.search(ownerId, query);

        const response = new ApiResponse(
            200,
            result,
            'Projects search completed'
        );

        res.status(response.statuscode).json(response);
    }

    static async getSDKConfig(req, res) {
        const { projectId } = req.params;
        const ownerId = req.user.id;

        const config = await ProjectService.getSDKConfig(projectId, ownerId);

        const response = new ApiResponse(
            200,
            config,
            'Project SDK configuration retrieved'
        );

        res.status(response.statuscode).json(response);
    }

    static async getConfig(req, res) {
        const { projectId } = req.params;
        const ownerId = req.user.id;

        const config = await ProjectService.getConfig(projectId, ownerId);

        const response = new ApiResponse(
            200,
            config,
            'Project config retrieved successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async updateConfig(req, res) {
        const { projectId } = req.params;
        const configData = req.body;
        const ownerId = req.user.id;

        const config = await ProjectService.updateConfig(projectId, ownerId, configData);

        const response = new ApiResponse(
            200,
            config,
            'Project config updated successfully'
        );

        res.status(response.statuscode).json(response);
    }
}