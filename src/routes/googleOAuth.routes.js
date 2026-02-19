import express from 'express';
import { googleOAuthController } from '../controllers/googleOAuth.controller.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleOAuthController.redirectToGoogle.bind(googleOAuthController));
router.get('/google/callback', googleOAuthController.handleCallback.bind(googleOAuthController));

// Protected routes (add auth middleware as needed)
router.post('/google/refresh/:identityId', googleOAuthController.refreshAccessToken.bind(googleOAuthController));
router.post('/google/revoke/:identityId', googleOAuthController.revokeAccess.bind(googleOAuthController));

export default router;