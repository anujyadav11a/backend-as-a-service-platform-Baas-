import { getRepositories } from '../repositories/factory.js';
import { Project } from '../../project/models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { BaaSEvents } from '../../../shared/events/baasEvents.js';
import { DocumentService } from './DocumentService.js';
import { AttributeService } from './AttributeService.js';

export class CollectionService {
  static get collection() {
    return getRepositories().collection;
  }

  static get database() {
    return getRepositories().database;
  }

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

    const database = await this.database.findById(databaseId);
    if (!database || database.project_id !== projectId) {
      throw ApiError.notFound('Database not found');
    }

    const exists = await this.collection.existsByName(databaseId, name);
    if (exists) {
      throw ApiError.conflict('Collection with this name already exists in the database');
    }

    const result = await this.collection.create({ projectId, databaseId, name });

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

    const collection = await this.collection.findById(collectionId, projectId);
    if (!collection) {
      throw ApiError.notFound('Collection not found');
    }

    const result = await this.collection.deleteById(collectionId, projectId);

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

    const database = await this.database.findById(databaseId);
    if (!database || database.project_id !== projectId) {
      throw ApiError.notFound('Database not found');
    }

    const collections = await this.collection.findByDatabaseId(databaseId, projectId);

    return collections.map(col => ({
      id: col.id,
      name: col.name,
      database_id: col.database_id,
      project_id: col.project_id,
      created_at: col.created_at,
      updated_at: col.updated_at
    }));
  }

  static async deleteAllForDatabase({ projectId, databaseId, userId }) {
    logger.info('Deleting all collections for database', { databaseId, projectId, userId });

    const collections = await this.collection.findAllByDatabaseId(databaseId, projectId);
    
    for (const col of collections) {
      await this._deleteCollectionCascade(col.id, projectId, userId);
    }

    const result = await this.collection.deleteAllByDatabaseId(databaseId, projectId);

    logger.info('All collections deleted for database', { databaseId, projectId, deletedCount: result.deletedCount, userId });
    
    return { deletedCount: result.deletedCount };
  }

  static async _deleteCollectionCascade(collectionId, projectId, userId) {
    logger.info('Deleting collection cascade', { collectionId, projectId, userId });

    await DocumentService.deleteAllForCollection({ collectionId, projectId, userId });
    await AttributeService.deleteAllForCollection({ collectionId, projectId, userId });

    logger.info('Collection cascade deleted', { collectionId, projectId });
    
    eventBus.emit(BaaSEvents.COLLECTION_DELETED, {
      collectionId,
      projectId,
      userId
    });
  }
}