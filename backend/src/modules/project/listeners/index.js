import { eventBus } from '../../../shared/events/EventBus.js';
import { ProjectEvents } from '../../../shared/events/projectEvents.js';
import { logger } from '../../../shared/utils/Logger.js';

/**
 * Initialize project domain event listeners.
 */
export function initProjectListeners() {
  // Project created
  eventBus.on(ProjectEvents.PROJECT_CREATED, async (payload) => {
    try {
      logger.info('Project event: project.created', payload);
      // If a default database is required per project, create it here via DatabaseService.
      // Currently the application does not auto‑create a default database, so we only log.
    } catch (err) {
      logger.error('Listener error for project.created', { error: err.message, payload });
    }
  });

  // Project updated
  eventBus.on(ProjectEvents.PROJECT_UPDATED, async (payload) => {
    try {
      logger.info('Project event: project.updated', payload);
    } catch (err) {
      logger.error('Listener error for project.updated', { error: err.message, payload });
    }
  });

  // Project deleted
  eventBus.on(ProjectEvents.PROJECT_DELETED, async (payload) => {
    try {
      logger.info('Project event: project.deleted', payload);
      // Cascade deletion of BaaS resources (databases, collections, documents) is intentionally
      // NOT performed here because the existing delete flow performs a synchronous soft‑delete
      // and relies on application‑level cleanup. Replacing it with an async event would break
      // transactional guarantees.
    } catch (err) {
      logger.error('Listener error for project.deleted', { error: err.message, payload });
    }
  });

  // API key generated
  eventBus.on(ProjectEvents.API_KEY_GENERATED, async (payload) => {
    try {
      logger.info('Project event: api_key.generated', payload);
    } catch (err) {
      logger.error('Listener error for api_key.generated', { error: err.message, payload });
    }
  });

  // API key revoked
  eventBus.on(ProjectEvents.API_KEY_REVOKED, async (payload) => {
    try {
      logger.info('Project event: api_key.revoked', payload);
    } catch (err) {
      logger.error('Listener error for api_key.revoked', { error: err.message, payload });
    }
  });
}