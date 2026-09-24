

import config from '../config/env.js';

const isProduction = config.app.isProduction;

/**
 * Canonical cookie names — single source of truth for setting & reading.
 */
export const COOKIE_NAMES = {
  console: {
    access: 'AccessToken',
    refresh: 'RefreshToken',
    session: 'sessionId',
  },
  tenant: {
    access: 'tenantAccessToken',
    refresh: 'tenantRefreshToken',
    session: 'sessionId',
  },
};

/**
 * Base cookie options applied to all cookies
 */
export const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    partitioned: isProduction,
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
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    partitioned: isProduction,
};

/**
 * Helper to set auth cookies consistently
 */
export const setAuthCookies = (res, tokens, type = 'console') => {
    const { access, refresh, session } = COOKIE_NAMES[type];

    res.cookie(refresh, tokens.refreshToken, refreshTokenCookieOptions)
       .cookie(access, tokens.accessToken, accessTokenCookieOptions)
       .cookie(session, tokens.sessionToken, sessionCookieOptions);

       return res;
};

/**
 * Helper to clear auth cookies consistently
 */
export const clearAuthCookies = (res, type = 'console') => {
    const { access, refresh, session } = COOKIE_NAMES[type];

    res.clearCookie(refresh, clearCookieOptions)
       .clearCookie(access, clearCookieOptions)
       .clearCookie(session, clearCookieOptions);

       return res;
};