import { ApiKeyService } from '../services/ApiKeyService.js';
import { ApiResponse } from '../../../shared/utils/apiresponse.js';

export class ApiKeyController {
    static async generate(req, res) {
        const { slug } = req.params;
        const { name, permissions = ['read'], environment = 'development' } = req.body;
        const ownerId = req.user.id;

        const apiKeyData = await ApiKeyService.generate(slug, { name, permissions, environment }, ownerId);

        const response = new ApiResponse(
            201,
            apiKeyData,
            'API key generated successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async list(req, res) {
        const { slug } = req.params;
        const ownerId = req.user.id;

        const keys = await ApiKeyService.list(slug, ownerId);

        const response = new ApiResponse(
            200,
            { keys },
            'API keys retrieved successfully'
        );

        res.status(response.statuscode).json(response);
    }

    static async revoke(req, res) {
        const { slug, keyId } = req.params;
        const ownerId = req.user.id;

        await ApiKeyService.revoke(slug, keyId, ownerId);

        const response = new ApiResponse(
            200,
            null,
            'API key revoked successfully'
        );

        res.status(response.statuscode).json(response);
    }
}