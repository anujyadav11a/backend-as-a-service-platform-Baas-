import { ApiKeyService } from '../services/ApiKeyService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';

export class ApiKeyController {
    static async generate(req, res) {
        const { projectId } = req.params;
        const { name, permissions = ['read'], environment = 'development' } = req.body;
        const ownerId = req.user.id;

        const apiKeyData = await ApiKeyService.generate(projectId, { name, permissions, environment }, ownerId);

        const response = new ApiResponse(
            201,
            apiKeyData,
            'API key generated successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async list(req, res) {
        const { projectId } = req.params;
        const ownerId = req.user.id;

        const keys = await ApiKeyService.list(projectId, ownerId);

        const response = new ApiResponse(
            200,
            { keys },
            'API keys retrieved successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async revoke(req, res) {
        const { projectId, keyId } = req.params;
        const ownerId = req.user.id;

        await ApiKeyService.revoke(projectId, keyId, ownerId);

        const response = new ApiResponse(
            200,
            null,
            'API key revoked successfully'
        );

        res.status(response.statuscode).json(response);
    }
}