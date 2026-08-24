/**
 * Auth domain event names
 * @readonly
 * @enum {string}
 */
export const AuthEvents = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  TENANT_USER_REGISTERED: 'tenant.user.registered',
  TENANT_USER_LOGGED_IN: 'tenant.user.logged_in',
  TENANT_USER_LOGGED_OUT: 'tenant.user.logged_out',
  OAUTH_GOOGLE_CALLBACK: 'oauth.google.callback',
  OAUTH_TOKEN_REFRESHED: 'oauth.token.refreshed',
  OAUTH_REVOKED: 'oauth.revoked',
};