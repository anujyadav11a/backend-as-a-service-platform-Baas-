import express from 'express';
import { googleOAuthController } from '../controllers/googleOAuth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', asyncHandler(googleOAuthController.redirectToGoogle.bind(googleOAuthController)));
router.get('/google/callback', asyncHandler(googleOAuthController.handleCallback.bind(googleOAuthController)));

// Protected routes (add auth middleware as needed)
router.post('/google/refresh/:identityId', asyncHandler(googleOAuthController.refreshAccessToken.bind(googleOAuthController)));
router.post('/google/revoke/:identityId', asyncHandler(googleOAuthController.revokeAccess.bind(googleOAuthController)));

export default router;