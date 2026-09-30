import axiosInstance from '../../../api/axiosInstance';
import { axiosAuth } from '../../../api/axiosInstance';

/**
 * @typedef {Object} RegisterRequest
 * @property {string} name - User's full name (2-50 chars)
 * @property {string} email - User's email address
 * @property {string} password - User's password (min 6 chars)
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} id - User ID
 * @property {string} email - User's email
 * @property {string} name - User's full name
 */

/**
 * @typedef {Object} SessionResponse
 * @property {string} id - Session ID
 * @property {string} ip_address - Client IP address
 * @property {Object} device_info - Device information
 * @property {Object} location - Geographic location
 * @property {string} login_method - Authentication method used
 * @property {string} last_activity - Last activity timestamp
 * @property {string} created_at - Session creation timestamp
 */

/**
 * @typedef {Object} TokensResponse
 * @property {string} accessToken - Short-lived access JWT
 * @property {string} refreshToken - Long-lived refresh JWT
 * @property {string} sessionToken - Session identifier
 */

/**
 * @typedef {Object} AuthSuccessResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {UserResponse} [data.user] - User object (login/register)
 * @property {TokensResponse} [data.tokens] - Token set (login/refresh)
 * @property {SessionResponse} [data.session] - Session info (login)
 * @property {SessionResponse[]} [data] - Session list (getSessions)
 */

/**
 * @typedef {Object} AuthErrorResponse
 * @property {boolean} success - Always false
 * @property {Object} error - Error details
 * @property {string} error.code - Error code
 * @property {string} error.message - Human-readable message
 * @property {Object} [error.details] - Additional error details
 */

/**
 * @typedef {Object} AxiosResponse<T>
 * @property {T} data - Response data
 * @property {number} status - HTTP status code
 * @property {string} statusText - HTTP status text
 * @property {Object} headers - Response headers
 * @property {Object} config - Request config
 * @property {Object} [request] - Request object
 */

/**
 * @typedef {Object} GoogleAuthUrlResponse
 * @property {boolean} success
 * @property {{authUrl:string, state:string}} data
 */

/**
 * @typedef {Object} GoogleCallbackResponse
 * @property {boolean} success
 * @property {{user:UserResponse, tokens:TokensResponse, session:SessionResponse, oauth:{provider:string, provider_id:string, provider_email:string, is_primary:boolean, connected_at:string}}} data
 */

/**
 * @typedef {Object} GoogleTokenRefreshResponse
 * @property {boolean} success
 * @property {{access_token:string, expires_in:number, token_type:string}} data
 */

/**
 * @typedef {Object} GoogleRevokeResponse
 * @property {boolean} success
 * @property {null} data
 */

export const authApi = {
  /**
   * Register a new console user
   * @param {RegisterRequest} data - Registration data
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  register: (data) =>
    axiosInstance.post('/users/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    }),

  /**
   * Login console user
   * @param {LoginRequest} data - Login credentials
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  login: (data) =>
    axiosInstance.post('/users/login', {
      email: data.email,
      password: data.password,
    }),

  /**
   * Refresh access token using refresh token cookie
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  refreshToken: () =>
    axiosInstance.post('/users/refresh'),

  /**
   * Logout current user (revokes refresh token)
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  logout: () =>
    axiosInstance.post('/users/logout'),

  /**
   * Get current authenticated user profile
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  getMe: () =>
    axiosInstance.get('/users/me'),

  /**
   * Get all active sessions for current user
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  getSessions: () =>
    axiosInstance.get('/users/sessions'),

  /**
   * Revoke a specific session
   * @param {string} sessionId - Session ID to revoke
   * @returns {Promise<AxiosResponse<AuthSuccessResponse>>}
   */
  revokeSession: (sessionId) =>
    axiosInstance.delete(`/users/sessions/${sessionId}`),

  /**
   * Initiate Google OAuth flow – returns consent URL and CSRF state
   * @returns {Promise<AxiosResponse<GoogleAuthUrlResponse>>}
   */
  getGoogleAuthUrl: () =>
    axiosAuth.get('/auth/google'),

  /**
   * Handle the redirect callback from Google.
   * Browser will call this route with ?code=...&state=...
   * @param {string} code - Authorization code from Google
   * @param {string} state - CSRF state parameter
   * @returns {Promise<AxiosResponse<GoogleCallbackResponse>>}
   */
  handleGoogleCallback: (code, state) =>
    axiosAuth.get('/auth/google/callback', { params: { code, state } }),

  /**
   * Refresh a stored Google refresh-token (used by “manage connections” UI)
   * @param {string} identityId - Identity document ID
   * @returns {Promise<AxiosResponse<GoogleTokenRefreshResponse>>}
   */
  refreshGoogleToken: (identityId) =>
    axiosAuth.post(`/auth/google/refresh/${identityId}`),

  /**
   * Revoke Google access for a linked identity
   * @param {string} identityId - Identity document ID
   * @returns {Promise<AxiosResponse<GoogleRevokeResponse>>}
   */
  revokeGoogleAccess: (identityId) =>
    axiosAuth.post(`/auth/google/revoke/${identityId}`),
};

export default authApi;