import { CollectionRepository } from '../repositories/CollectionRepository.js';
import { DatabaseRepository } from '../repositories/DatabaseRepository.js';
import { Project } from '../../project/models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { BaaSEvents } from '../../../shared/events/baasEvents.js';

export class CollectionService {
  static async create({ projectId, databaseId, name, userId }) {
    logger.info('Creating new collection', { userId, name, databaseId, projectId });

    const project = await Project.findOne({
      project_id: projectId,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const database = await DatabaseRepository.findById(databaseId);
    if (!database || database.project_id !== projectId) {
      throw ApiError.notFound('Database not found');
    }

    const exists = await CollectionRepository.existsByName(databaseId, name);
    if (exists) {
      throw ApiError.conflict('Collection with this name already exists in the database');
    }

    const result = await CollectionRepository.create({ projectId, databaseId, name });

    if (result.exists) {
      throw ApiError.conflict('Collection with this name already exists in the database');
    }

    logger.info('Collection created successfully', {
      collectionId: result.created.id,
      name: result.created.name,
      database_id: result.created.database_id,
      project_id: result.created.project_id,
      userId
    });

    eventBus.emit(BaaSEvents.COLLECTION_CREATED, {
      collectionId: result.created.id,
      name: result.created.name,
      databaseId: result.created.database_id,
      projectId: result.created.project_id,
      userId
    });

    return result.created;
  }

  static async delete({ projectId, collectionId, userId }) {
    logger.info('Deleting collection', { collectionId, projectId, userId });

    const project = await Project.findOne({
      project_id: projectId,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const collection = await CollectionRepository.findById(collectionId, projectId);
    if (!collection) {
      throw ApiError.notFound('Collection not found');
    }

    const result = await CollectionRepository.deleteById(collectionId, projectId);

    if (result.notFound) {
      throw ApiError.notFound('Collection not found');
    }

    logger.info('Collection deleted successfully', {
      collectionId: result.deleted.id,
      name: result.deleted.name,
      database_id: result.deleted.database_id,
      project_id: result.deleted.project_id,
      userId
    });

    eventBus.emit(BaaSEvents.COLLECTION_DELETED, {
      collectionId: result.deleted.id,
      name: result.deleted.name,
      databaseId: result.deleted.database_id,
      projectId: result.deleted.project_id,
      userId
    });

    return result.deleted;
  }

  static async listByDatabase({ projectId, databaseId, userId }) {
    logger.info('Listing all collections', { databaseId, projectId, userId });

    const project = await Project.findOne({
      project_id: projectId,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const database = await DatabaseRepository.findById(databaseId);
    if (!database || database.project_id !== projectId) {
      throw ApiError.notFound('Database not found');
    }

    const collections = await CollectionRepository.findByDatabaseId(databaseId, projectId);

    return collections.map(col => ({
      id: col.id,
      name: col.name,
      database_id: col.database_id,
      project_id: col.project_id,
      created_at: col.created_at,
      updated_at: col.updated_at
    }));
  }
}