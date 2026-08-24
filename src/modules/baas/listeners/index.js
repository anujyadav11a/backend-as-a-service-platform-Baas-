import { eventBus } from '../../../shared/events/EventBus.js';
import { BaaSEvents } from '../../../shared/events/baasEvents.js';
import { logger } from '../../../shared/utils/Logger.js';

/**
 * Initialize BaaS domain event listeners.
 * Currently logs events for observability.
 */
export function initBaaSListeners() {
  // Database events
  eventBus.on(BaaSEvents.DATABASE_CREATED, async (payload) => {
    try {
      logger.info('BaaS event: database.created', payload);
    } catch (err) {
      logger.error('Listener error for database.created', { error: err.message, payload });
    }
  });

  eventBus.on(BaaSEvents.DATABASE_DELETED, async (payload) => {
    try {
      logger.info('BaaS event: database.deleted', payload);
    } catch (err) {
      logger.error('Listener error for database.deleted', { error: err.message, payload });
    }
  });

  // Collection events
  eventBus.on(BaaSEvents.COLLECTION_CREATED, async (payload) => {
    try {
      logger.info('BaaS event: collection.created', payload);
    } catch (err) {
      logger.error('Listener error for collection.created', { error: err.message, payload });
    }
  });

  eventBus.on(BaaSEvents.COLLECTION_DELETED, async (payload) => {
    try {
      logger.info('BaaS event: collection.deleted', payload);
    } catch (err) {
      logger.error('Listener error for collection.deleted', { error: err.message, payload });
    }
  });

  // Attribute events
  eventBus.on(BaaSEvents.ATTRIBUTE_CREATED, async (payload) => {
    try {
      logger.info('BaaS event: attribute.created', payload);
    } catch (err) {
      logger.error('Listener error for attribute.created', { error: err.message, payload });
    }
  });

  eventBus.on(BaaSEvents.ATTRIBUTE_UPDATED, async (payload) => {
    try {
      logger.info('BaaS event: attribute.updated', payload);
    } catch (err) {
      logger.error('Listener error for attribute.updated', { error: err.message, payload });
    }
  });

  eventBus.on(BaaSEvents.ATTRIBUTE_DELETED, async (payload) => {
    try {
      logger.info('BaaS event: attribute.deleted', payload);
    } catch (err) {
      logger.error('Listener error for attribute.deleted', { error: err.message, payload });
    }
  });

  // Document events
  eventBus.on(BaaSEvents.DOCUMENT_INSERTED, async (payload) => {
    try {
      logger.info('BaaS event: document.inserted', payload);
    } catch (err) {
      logger.error('Listener error for document.inserted', { error: err.message, payload });
    }
  });

  eventBus.on(BaaSEvents.DOCUMENT_UPDATED, async (payload) => {
    try {
      logger.info('BaaS event: document.updated', payload);
    } catch (err) {
      logger.error('Listener error for document.updated', { error: err.message, payload });
    }
  });

  eventBus.on(BaaSEvents.DOCUMENT_DELETED, async (payload) => {
    try {
      logger.info('BaaS event: document.deleted', payload);
    } catch (err) {
      logger.error('Listener error for document.deleted', { error: err.message, payload });
    }
  });
}