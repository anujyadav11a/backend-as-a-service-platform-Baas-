import express from 'express';
import { OAuthController } from '../controllers/OAuthController.js';

const router = express.Router();

// Google OAuth routes (mounted at /auth)
router.get('/google', OAuthController.redirectToGoogle);
router.get('/google/callback', OAuthController.handleCallback);
router.post('/google/refresh/:identityId', OAuthController.refreshAccessToken);
router.post('/google/revoke/:identityId', OAuthController.revokeAccess);

export default router;