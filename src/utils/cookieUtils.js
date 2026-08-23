/**
 * Centralized cookie configuration for security hardening
 * 
 * Secure cookies in all environments (requires HTTPS in dev via mkcert or tunnel)
 * sameSite: 'lax' for better compatibility while maintaining CSRF protection
 * httpOnly: true to prevent XSS
 * partitioned: true for Chrome's CHIPS (cross-site cookie isolation)
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Base cookie options applied to all cookies
 */
export const baseCookieOptions = {
    httpOnly: true,
    secure: true, // Always true - requires HTTPS in all environments
    sameSite: 'lax', // CSRF-safe with better compatibility than 'strict'
    partitioned: true, // Chrome CHIPS support for cross-site cookie isolation
};

/**
 * Cookie options for access tokens (shorter expiry)
 */
export const accessTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Cookie options for refresh tokens (longer expiry)
 */
export const refreshTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Cookie options for session IDs
 */
export const sessionCookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Cookie options for clearing cookies (logout)
 */
export const clearCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    partitioned: true,
};

/**
 * Helper to set auth cookies consistently
 */
export const setAuthCookies = (res, tokens, type = 'console') => {
    const prefix = type === 'tenant' ? 'tenant' : '';
    const refreshName = `${prefix}RefreshToken`;
    const accessName = `${prefix}AccessToken`;
    const sessionName = 'sessionId';

    res.cookie(refreshName, tokens.refreshToken, refreshTokenCookieOptions)
       .cookie(accessName, tokens.accessToken, accessTokenCookieOptions)
       .cookie(sessionName, tokens.sessionToken, sessionCookieOptions);
};

/**
 * Helper to clear auth cookies consistently
 */
export const clearAuthCookies = (res, type = 'console') => {
    const prefix = type === 'tenant' ? 'tenant' : '';
    const refreshName = `${prefix}RefreshToken`;
    const accessName = `${prefix}AccessToken`;
    const sessionName = 'sessionId';

    res.clearCookie(refreshName, clearCookieOptions)
       .clearCookie(accessName, clearCookieOptions)
       .clearCookie(sessionName, clearCookieOptions);
};