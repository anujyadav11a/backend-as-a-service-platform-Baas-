import { ApiResponse } from '../utils/apiresponse.js';
import { asyncHandler } from '../utils/asynchandler.js';

export const testOAuth = asyncHandler(async (req, res) => {
    const response = new ApiResponse(
        200,
        {
            endpoints: {
                'GET /auth/google': 'Initiate Google OAuth',
                'GET /auth/google/callback': 'Handle Google OAuth callback',
                'POST /auth/google/refresh/:identityId': 'Refresh access token',
                'POST /auth/google/revoke/:identityId': 'Revoke OAuth access'
            },
            setup: {
                'Environment Variables': [
                    'GOOGLE_CLIENT_ID',
                    'GOOGLE_CLIENT_SECRET', 
                    'GOOGLE_REDIRECT_URI',
                    'OAUTH_ENCRYPTION_KEY'
                ],
                'Next Steps': [
                    '1. Set up Google OAuth credentials in Google Cloud Console',
                    '2. Update .env with your actual Google OAuth credentials',
                    '3. Test the /auth/google endpoint'
                ]
            }
        },
        'OAuth system is ready'
    );

    res.status(response.statuscode).json(response);
});