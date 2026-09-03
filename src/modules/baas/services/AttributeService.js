import { getRepositories } from '../repositories/factory.js';
import { Project } from '../../project/models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { BaaSEvents } from '../../../shared/events/baasEvents.js';

const validSqlTypes = [
  'VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT',
  'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'INTEGER', 'BIGINT',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
  'BINARY', 'VARBINARY', 'BLOB', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB',
  'JSON', 'BOOLEAN', 'BOOL', 'ENUM', 'SET'
];

function validateSqlType(type) {
  const sanitizedType = type.trim().toUpperCase();
  const baseType = sanitizedType.split('(')[0];

  if (validSqlTypes.includes(sanitizedType)) {
    return { valid: true, normalizedType: sanitizedType };
  }

  if (sanitizedType.match(/^(VARCHAR|CHAR|BINARY|VARBINARY)\(\d+\)$/)) {
    return { valid: true, normalizedType: sanitizedType };
  }

  if (sanitizedType.match(/^(DECIMAL|NUMERIC)\(\d+,\d+\)$/)) {
    return { valid: true, normalizedType: sanitizedType };
  }

  if (sanitizedType.match(/^(FLOAT|DOUBLE)\(\d+,\d+\)$/)) {
    return { valid: true, normalizedType: sanitizedType };
  }

  if (sanitizedType.match(/^ENUM\(.+\)$/)) {
    return { valid: true, normalizedType: sanitizedType };
  }

  if (sanitizedType.match(/^SET\(.+\)$/)) {
    return { valid: true, normalizedType: sanitizedType };
  }

  return { valid: false };
}

function validateAttributeName(name) {
  const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!nameRegex.test(name)) {
    throw ApiError.badRequest(
      'Invalid column name. Column names must start with a letter or underscore and contain only letters, numbers, and underscores.'
    );
  }
  if (name.length > 64) {
    throw ApiError.badRequest('Column name cannot exceed 64 characters');
  }
}

export class AttributeService {
  static get attribute() {
    return getRepositories().attribute;
  }

  static get collection() {
    return getRepositories().collection;
  }

  static get database() {
    return getRepositories().database;
  }

  static async create({ projectId, collectionId, databaseId, name, type, required = false, userId }) {
    logger.info('Adding new column to collection', { collectionId, name, type, required, projectId, databaseId });

    validateAttributeName(name);

    const typeValidation = validateSqlType(type);
    if (!typeValidation.valid) {
      throw ApiError.badRequest(
        `Invalid SQL data type: '${type}'. Supported types include: ${validSqlTypes.join(', ')}. ` +
        `You can also use types with specifications like VARCHAR(255), DECIMAL(10,2), ENUM('val1','val2'), etc.`
      );
    }

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

    const collection = await this.collection.findById(collectionId, projectId);
    if (!collection || collection.database_id !== databaseId) {
      throw ApiError.notFound('Collection not found');
    }

    const exists = await this.attribute.findByName(collectionId, name);
    if (exists) {
      throw ApiError.conflict('Attribute with this name already exists in the collection');
    }

    const result = await this.attribute.create({
      projectId,
      collectionId,
      databaseId,
      name,
      type: typeValidation.normalizedType,
      required
    });

    logger.info('Column added successfully', {
      attributeId: result.created.id,
      collectionId,
      name: result.created.name,
      projectId
    });

    eventBus.emit(BaaSEvents.ATTRIBUTE_CREATED, {
      attributeId: result.created.id,
      name: result.created.name,
      type: result.created.type,
      required: Boolean(result.created.required),
      collectionId,
      databaseId: result.created.database_id,
      projectId: result.created.project_id,
      userId
    });

    return result.created;
  }

  static async listByCollection({ projectId, collectionId, userId }) {
    logger.info('Fetching attributes for collection', { collectionId, projectId });

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

    const attributes = await this.attribute.findByCollectionId(collectionId, projectId);

    return attributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      type: attr.type,
      required: Boolean(attr.required),
      collection_id: attr.collection_id,
      database_id: attr.database_id,
      created_at: attr.created_at,
      updated_at: attr.updated_at
    }));
  }

  static async update({ projectId, collectionId, attributeId, name, type, required, userId }) {
    logger.info('Updating attribute', { attributeId, projectId, fieldsToUpdate: { name, type, required } });

    if (name === undefined && type === undefined && required === undefined) {
      throw ApiError.badRequest('At least one field (name, type, or required) must be provided for update');
    }

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

    const existingAttr = await this.attribute.findById(attributeId, projectId);
    if (!existingAttr) {
      throw ApiError.notFound('Attribute not found or does not belong to your project');
    }

    if (existingAttr.collection_id !== collectionId) {
      throw ApiError.notFound('Attribute not found or does not belong to your project');
    }

    const updates = {};

    if (name !== undefined) {
      validateAttributeName(name);
      const exists = await this.attribute.findByName(collectionId, name, attributeId);
      if (exists) {
        throw ApiError.conflict('An attribute with this name already exists in the collection');
      }
      updates.name = name;
    }

    if (type !== undefined) {
      const typeValidation = validateSqlType(type);
      if (!typeValidation.valid) {
        throw ApiError.badRequest(`Invalid SQL data type: '${type}'`);
      }
      updates.type = typeValidation.normalizedType;
    }

    if (required !== undefined) {
      updates.required = required ? 1 : 0;
    }

    const result = await this.attribute.update(attributeId, projectId, updates);

    if (result.notFound) {
      throw ApiError.notFound('Attribute not found or does not belong to your project');
    }

    if (result.noChanges) {
      throw ApiError.badRequest('No valid fields to update');
    }

    logger.info('Attribute updated successfully', { attributeId, updates });

    eventBus.emit(BaaSEvents.ATTRIBUTE_UPDATED, {
      attributeId: result.updated.id,
      name: result.updated.name,
      type: result.updated.type,
      required: Boolean(result.updated.required),
      collectionId: result.updated.collection_id,
      databaseId: result.updated.database_id,
      projectId: result.updated.project_id,
      userId
    });

    return result.updated;
  }

  static async delete({ projectId, collectionId, attributeId, userId }) {
    logger.info('Deleting attribute', { attributeId, projectId });

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

    const result = await this.attribute.deleteById(attributeId, projectId);

    if (result.notFound) {
      throw ApiError.notFound('Attribute not found or does not belong to your project');
    }

    if (result.lastAttribute) {
      throw ApiError.badRequest(
        'Cannot delete the last attribute in a collection. A collection must have at least one attribute.'
      );
    }

    logger.info('Attribute deleted successfully', {
      attributeId: result.deleted.id,
      collectionId: result.deleted.collection_id,
      documentsAffected: 0
    });

    eventBus.emit(BaaSEvents.ATTRIBUTE_DELETED, {
      attributeId: result.deleted.id,
      name: result.deleted.name,
      collectionId: result.deleted.collection_id,
      databaseId: result.deleted.database_id,
      projectId,
      userId
    });

    return {
      id: result.deleted.id,
      name: result.deleted.name,
      deleted: true,
      documentsAffected: 0
    };
  }

  static async deleteAllForCollection({ collectionId, projectId, userId }) {
    logger.info('Deleting all attributes for collection', { collectionId, projectId, userId });

    const result = await this.attribute.deleteAllByCollectionId(collectionId);

    logger.info('All attributes deleted for collection', { collectionId, projectId, deletedCount: result.deletedCount, userId });
    
    return { deletedCount: result.deletedCount };
  }
}