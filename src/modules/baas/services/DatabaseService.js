import { DatabaseRepository } from '../repositories/DatabaseRepository.js';
import { CollectionRepository } from '../repositories/CollectionRepository.js';
import { Project } from '../../project/models/Project.js';
import { invalidateCache } from '../../../shared/utils/cacheInvalidation.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { BaaSEvents } from '../../../shared/events/baasEvents.js';
import { CollectionService } from './CollectionService.js';

export class DatabaseService {
  static async create({ projectId, name, userId }) {
    logger.info('Creating new database', { userId, name, projectId });

    const project = await Project.findOne({
      project_id: projectId,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const exists = await DatabaseRepository.existsByName(projectId, name);
    if (exists) {
      throw ApiError.conflict('Database with this name already exists in the project');
    }

    const result = await DatabaseRepository.create({ projectId, name });

    if (result.exists) {
      throw ApiError.conflict('Database with this name already exists in the project');
    }

    await invalidateCache(['database-list:' + projectId]);

    logger.info('Database created successfully', {
      databaseId: result.created.id,
      name: result.created.name,
      project_id: result.created.project_id,
      userId
    });

    eventBus.emit(BaaSEvents.DATABASE_CREATED, {
      databaseId: result.created.id,
      name: result.created.name,
      projectId: result.created.project_id,
      userId
    });

    return result.created;
  }

  static async delete({ projectId, databaseId, userId }) {
    logger.info('Deleting database', { databaseId, userId });

    const database = await DatabaseRepository.findById(databaseId);
    if (!database) {
      throw ApiError.notFound('Database not found');
    }

    const project = await Project.findOne({
      project_id: database.project_id,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const result = await DatabaseRepository.deleteById(databaseId, database.project_id);

    if (result.notFound) {
      throw ApiError.notFound('Database not found');
    }

    if (result.forbidden) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    await invalidateCache(['database-list:' + database.project_id]);

    logger.info('Database deleted successfully', {
      databaseId: result.deleted.id,
      name: result.deleted.name,
      project_id: result.deleted.project_id,
      userId
    });

    eventBus.emit(BaaSEvents.DATABASE_DELETED, {
      databaseId: result.deleted.id,
      name: result.deleted.name,
      projectId: result.deleted.project_id,
      userId
    });

    return result.deleted;
  }

  static async listByProject({ projectId, userId }) {
    logger.info('Listing all databases for project', { projectId, userId });

    const project = await Project.findOne({
      project_id: projectId,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const databases = await DatabaseRepository.findByProjectId(projectId);

    return databases.map(db => ({
      id: db.id,
      name: db.name,
      project_id: db.project_id,
      created_at: db.created_at,
      updated_at: db.updated_at
    }));
  }

  static async deleteAllForProject({ projectId, userId }) {
    logger.info('Deleting all databases for project', { projectId, userId });

    const project = await Project.findOne({
      project_id: projectId,
      owner_id: userId,
      status: 'active'
    });

    if (!project) {
      throw ApiError.forbidden('Project not found or access denied');
    }

    const databases = await DatabaseRepository.findAllByProjectId(projectId);
    
    for (const db of databases) {
      await this._deleteDatabaseCascade(db.id, projectId, userId);
    }

    const result = await DatabaseRepository.deleteAllByProjectId(projectId);

    logger.info('All databases deleted for project', { projectId, deletedCount: result.deletedCount, userId });
    
    return { deletedCount: result.deletedCount };
  }

  static async _deleteDatabaseCascade(databaseId, projectId, userId) {
    logger.info('Deleting database cascade', { databaseId, projectId, userId });

    const database = await DatabaseRepository.findById(databaseId);
    if (!database) {
      logger.warn('Database not found during cascade delete', { databaseId });
      return;
    }

    await CollectionService.deleteAllForDatabase({ projectId, databaseId, userId });

    logger.info('Database cascade deleted', { databaseId, projectId });
    
    eventBus.emit(BaaSEvents.DATABASE_DELETED, {
      databaseId: database.id,
      name: database.name,
      projectId: database.project_id,
      userId
    });
  }
}