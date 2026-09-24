import { eventBus } from '../../../shared/events/EventBus.js';
import { AuthEvents } from '../../../shared/events/authEvents.js';
import { logger } from '../../../shared/utils/Logger.js';

/**
 * Initialize auth domain event listeners.
 */
export function initAuthListeners() {
  // User registered
  eventBus.on(AuthEvents.USER_REGISTERED, async (payload) => {
    try {
      logger.info('Auth event: user.registered', payload);
      // Could integrate with audit service, analytics, etc.
    } catch (err) {
      logger.error('Listener error for user.registered', { error: err.message, payload });
    }
  });

  // User logged in
  eventBus.on(AuthEvents.USER_LOGGED_IN, async (payload) => {
    try {
      logger.info('Auth event: user.logged_in', payload);
    } catch (err) {
      logger.error('Listener error for user.logged_in', { error: err.message, payload });
    }
  });

  // User logged out
  eventBus.on(AuthEvents.USER_LOGGED_OUT, async (payload) => {
    try {
      logger.info('Auth event: user.logged_out', payload);
    } catch (err) {
      logger.error('Listener error for user.logged_out', { error: err.message, payload });
    }
  });

  // Tenant user registered
  eventBus.on(AuthEvents.TENANT_USER_REGISTERED, async (payload) => {
    try {
      logger.info('Auth event: tenant.user.registered', payload);
    } catch (err) {
      logger.error('Listener error for tenant.user.registered', { error: err.message, payload });
    }
  });

  // Tenant user logged in
  eventBus.on(AuthEvents.TENANT_USER_LOGGED_IN, async (payload) => {
    try {
      logger.info('Auth event: tenant.user.logged_in', payload);
    } catch (err) {
      logger.error('Listener error for tenant.user.logged_in', { error: err.message, payload });
    }
  });

  // Tenant user logged out
  eventBus.on(AuthEvents.TENANT_USER_LOGGED_OUT, async (payload) => {
    try {
      logger.info('Auth event: tenant.user.logged_out', payload);
    } catch (err) {
      logger.error('Listener error for tenant.user.logged_out', { error: err.message, payload });
    }
  });

  // OAuth Google callback
  eventBus.on(AuthEvents.OAUTH_GOOGLE_CALLBACK, async (payload) => {
    try {
      logger.info('Auth event: oauth.google.callback', payload);
    } catch (err) {
      logger.error('Listener error for oauth.google.callback', { error: err.message, payload });
    }
  });

  // OAuth token refreshed
  eventBus.on(AuthEvents.OAUTH_TOKEN_REFRESHED, async (payload) => {
    try {
      logger.info('Auth event: oauth.token.refreshed', payload);
    } catch (err) {
      logger.error('Listener error for oauth.token.refreshed', { error: err.message, payload });
    }
  });

  // OAuth revoked
  eventBus.on(AuthEvents.OAUTH_REVOKED, async (payload) => {
    try {
      logger.info('Auth event: oauth.revoked', payload);
    } catch (err) {
      logger.error('Listener error for oauth.revoked', { error: err.message, payload });
    }
  });
}