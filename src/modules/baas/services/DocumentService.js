import { getRepositories } from '../repositories/factory.js';
import { Project } from '../../project/models/Project.js';
import { ApiError } from '../../../shared/utils/apierror.js';
import { logger } from '../../../shared/utils/Logger.js';
import { eventBus } from '../../../shared/events/EventBus.js';
import { BaaSEvents } from '../../../shared/events/baasEvents.js';
import { invalidateCache } from '../../../shared/utils/cacheInvalidation.js';

const validOperators = [
  'equals', 'notEquals',
  'greaterThan', 'greaterThanOrEqual',
  'lessThan', 'lessThanOrEqual',
  'contains', 'notContains',
  'startsWith', 'endsWith',
  'in', 'notIn',
  'isNull', 'isNotNull'
];

function buildFilterConditions(filters, attributeMap) {
  return filters.map(filter => {
    const { field, operator, value } = filter;

    if (!field || !operator) {
      throw ApiError.badRequest('Each filter must have a field and operator');
    }

    if (!validOperators.includes(operator)) {
      throw ApiError.badRequest(`Invalid operator '${operator}'. Valid operators: ${validOperators.join(', ')}`);
    }

    if (!attributeMap.has(field)) {
      throw ApiError.badRequest(`Field '${field}' does not exist in the collection schema`);
    }

    const operatorsNeedingValue = validOperators.filter(op => !['isNull', 'isNotNull'].includes(op));
    if (operatorsNeedingValue.includes(operator) && value === undefined) {
      throw ApiError.badRequest(`Operator '${operator}' requires a value`);
    }

    return { field, operator, value };
  });
}

function applyFilter(data, condition) {
  const { field, operator, value } = condition;
  const fieldValue = data[field];

  switch (operator) {
    case 'equals': return fieldValue === value;
    case 'notEquals': return fieldValue !== value;
    case 'greaterThan': return fieldValue > value;
    case 'greaterThanOrEqual': return fieldValue >= value;
    case 'lessThan': return fieldValue < value;
    case 'lessThanOrEqual': return fieldValue <= value;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(value);
    case 'notContains':
      return typeof fieldValue === 'string' && !fieldValue.includes(value);
    case 'startsWith':
      return typeof fieldValue === 'string' && fieldValue.startsWith(value);
    case 'endsWith':
      return typeof fieldValue === 'string' && fieldValue.endsWith(value);
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    case 'notIn':
      return Array.isArray(value) && !value.includes(fieldValue);
    case 'isNull':
      return fieldValue === null || fieldValue === undefined;
    case 'isNotNull':
      return fieldValue !== null && fieldValue !== undefined;
    default: return false;
  }
}

function validateDataAgainstSchema(data, attributes) {
  const errors = [];
  const providedFields = Object.keys(data);
  const requiredFields = attributes.filter(attr => attr.required).map(attr => attr.name);
  const allowedFields = attributes.map(attr => attr.name);

  for (const requiredField of requiredFields) {
    if (!providedFields.includes(requiredField)) {
      errors.push(`Required field '${requiredField}' is missing`);
    }
  }

  for (const providedField of providedFields) {
    if (!allowedFields.includes(providedField)) {
      errors.push(`Field '${providedField}' is not defined in the collection schema`);
    }
  }

  for (const attribute of attributes) {
    const fieldName = attribute.name;
    const fieldType = attribute.type.toUpperCase();
    const fieldValue = data[fieldName];

    if (fieldValue === undefined || fieldValue === null) continue;

    if (fieldType.startsWith('VARCHAR') || fieldType.startsWith('CHAR') || fieldType.includes('TEXT')) {
      if (typeof fieldValue !== 'string') errors.push(`Field '${fieldName}' must be a string`);
    } else if (fieldType.includes('INT') || fieldType === 'BIGINT') {
      if (!Number.isInteger(fieldValue)) errors.push(`Field '${fieldName}' must be an integer`);
    } else if (fieldType.includes('DECIMAL') || fieldType.includes('FLOAT') || fieldType.includes('DOUBLE')) {
      if (typeof fieldValue !== 'number') errors.push(`Field '${fieldName}' must be a number`);
    } else if (fieldType === 'JSON') {
      if (typeof fieldValue !== 'object') errors.push(`Field '${fieldName}' must be a valid JSON object`);
    } else if (fieldType === 'BOOLEAN' || fieldType === 'BOOL') {
      if (typeof fieldValue !== 'boolean') errors.push(`Field '${fieldName}' must be a boolean`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

function generateDocumentId() {
  return 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

function getProjectIdFromContext(context) {
  if (context.authType === 'apiKey' && context.project) {
    return context.project._id || context.project.id;
  }
  if (context.projectId) {
    return context.projectId;
  }
  throw ApiError.badRequest('Project ID is required');
}

function getCollectionIdFromContext(context) {
  if (context.collectionId) {
    return context.collectionId;
  }
  throw ApiError.badRequest('Collection ID is required');
}

export class DocumentService {
  static get document() {
    return getRepositories().document;
  }

  static get attribute() {
    return getRepositories().attribute;
  }

  static get collection() {
    return getRepositories().collection;
  }

  static async create({ collectionId, projectId, data, authType, project }) {
    logger.info('Adding new document to collection', {
      collectionId, projectId, dataKeys: data ? Object.keys(data) : [], authType
    });

    const projectIdToUse = getProjectIdFromContext({ authType, project, projectId });
    const collectionIdToUse = getCollectionIdFromContext({ collectionId });

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw ApiError.badRequest('Data must be a valid JSON object');
    }

    const attributes = await this.attribute.findByCollectionId(collectionIdToUse, projectIdToUse);
    if (attributes.length === 0) {
      throw ApiError.badRequest('No attributes found for this collection. Please define the schema first.');
    }

    const validationResult = validateDataAgainstSchema(data, attributes);
    if (!validationResult.isValid) {
      throw ApiError.badRequest(`Data validation failed: ${validationResult.errors.join(', ')}`);
    }

    const documentId = generateDocumentId();

    const result = await this.document.create({
      projectId: projectIdToUse,
      collectionId: collectionIdToUse,
      data
    });

    if (result.notFound) {
      throw ApiError.badRequest('Invalid collection_id or project_id reference');
    }

    logger.info('Document added successfully', {
      documentId: result.created.id,
      collectionId: collectionIdToUse,
      projectId: projectIdToUse
    });

    eventBus.emit(BaaSEvents.DOCUMENT_INSERTED, {
      documentId: result.created.id,
      collectionId: collectionIdToUse,
      projectId: projectIdToUse,
      dataKeys: Object.keys(data),
      authType
    });

    return result.created;
  }

  static async list({ collectionId, projectId, page = 1, limit = 10, authType, project }) {
    logger.info('Retrieving documents from collection', { collectionId, projectId, page, limit, authType });

    const projectIdToUse = getProjectIdFromContext({ authType, project, projectId });
    const collectionIdToUse = getCollectionIdFromContext({ collectionId });

    const collection = await this.collection.findById(collectionIdToUse, projectIdToUse);
    if (!collection) {
      throw ApiError.badRequest('Invalid collection_id or project_id reference');
    }

    const documents = await this.document.findByCollectionId(collectionIdToUse, projectIdToUse, { page, limit });
    const totalDocuments = await this.document.countByCollectionId(collectionIdToUse, projectIdToUse);
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      documents,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  static async query({ collectionId, projectId, filters = [], sort, page = 1, limit = 10, authType, project }) {
    logger.info('Querying documents with filters', { collectionId, projectId, filterCount: filters.length, page, limit, authType });

    const projectIdToUse = getProjectIdFromContext({ authType, project, projectId });
    const collectionIdToUse = getCollectionIdFromContext({ collectionId });

    const collection = await this.collection.findById(collectionIdToUse, projectIdToUse);
    if (!collection) {
      throw ApiError.badRequest('Invalid collection_id or project_id reference');
    }

    const attributes = await this.attribute.findByCollectionId(collectionIdToUse, projectIdToUse);
    if (attributes.length === 0) {
      throw ApiError.badRequest('No attributes found for this collection');
    }

    const attributeMap = new Map(attributes.map(attr => [attr.name, attr.type]));
    const filterConditions = buildFilterConditions(filters, attributeMap);

    const allDocuments = await this.document.findAllByCollectionId(collectionIdToUse, projectIdToUse);
    let filteredDocuments = allDocuments.map(doc => ({
      id: doc.id,
      collection_id: doc.collection_id,
      data: doc.data,
      created_at: doc.created_at,
      project_id: doc.project_id
    }));

    if (filterConditions.length > 0) {
      filteredDocuments = filteredDocuments.filter(doc => {
        return filterConditions.every(condition => applyFilter(doc.data, condition));
      });
    }

    if (sort && sort.field) {
      const sortField = sort.field;
      const sortOrder = sort.order?.toLowerCase() === 'asc' ? 1 : -1;

      filteredDocuments.sort((a, b) => {
        let aVal = sortField === 'created_at' ? new Date(a.created_at) : a.data[sortField];
        let bVal = sortField === 'created_at' ? new Date(b.created_at) : b.data[sortField];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }

    const totalDocuments = filteredDocuments.length;
    const totalPages = Math.ceil(totalDocuments / limit);
    const offset = (page - 1) * limit;
    const paginatedDocuments = filteredDocuments.slice(offset, offset + limit);

    logger.info('Documents queried successfully', {
      collectionId: collectionIdToUse,
      projectId: projectIdToUse,
      totalMatched: totalDocuments,
      returned: paginatedDocuments.length
    });

    return {
      documents: paginatedDocuments,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  static async getById({ collectionId, projectId, documentId, authType, project }) {
    logger.info('Retrieving document by ID', { documentId, collectionId, projectId, authType });

    const projectIdToUse = getProjectIdFromContext({ authType, project, projectId });
    const collectionIdToUse = getCollectionIdFromContext({ collectionId });

    const document = await this.document.findById(documentId, projectIdToUse);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    logger.info('Document retrieved successfully', { documentId, projectId: projectIdToUse });
    return document;
  }

  static async update({ collectionId, projectId, documentId, data, authType, project }) {
    logger.info('Updating document', { documentId, collectionId, projectId, dataKeys: data ? Object.keys(data) : [], authType });

    const projectIdToUse = getProjectIdFromContext({ authType, project, projectId });
    const collectionIdToUse = getCollectionIdFromContext({ collectionId });

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw ApiError.badRequest('Data must be a valid JSON object');
    }

    const existingDoc = await this.document.findById(documentId, projectIdToUse);
    if (!existingDoc) {
      throw ApiError.notFound('Document not found');
    }

    const attributes = await this.attribute.findByCollectionId(collectionIdToUse, projectIdToUse);
    if (attributes.length === 0) {
      throw ApiError.badRequest('No attributes found for this collection');
    }

    const validationResult = validateDataAgainstSchema(data, attributes);
    if (!validationResult.isValid) {
      throw ApiError.badRequest(`Data validation failed: ${validationResult.errors.join(', ')}`);
    }

    const result = await this.document.updateById(documentId, projectIdToUse, data);
    if (result.notFound) {
      throw ApiError.notFound('Document not found or no changes made');
    }

    logger.info('Document updated successfully', { documentId, projectId: projectIdToUse });

    eventBus.emit(BaaSEvents.DOCUMENT_UPDATED, {
      documentId,
      collectionId: collectionIdToUse,
      projectId: projectIdToUse,
      dataKeys: Object.keys(data),
      authType
    });

    return result.updated;
  }

  static async delete({ collectionId, projectId, documentId, authType, project }) {
    logger.info('Deleting document', { documentId, collectionId, projectId, authType });

    const projectIdToUse = getProjectIdFromContext({ authType, project, projectId });
    const collectionIdToUse = getCollectionIdFromContext({ collectionId });

    const result = await this.document.deleteById(documentId, projectIdToUse);
    if (result.notFound) {
      throw ApiError.notFound('Document not found');
    }

    logger.info('Document deleted successfully', { documentId, projectId: projectIdToUse });

    eventBus.emit(BaaSEvents.DOCUMENT_DELETED, {
      documentId,
      collectionId: collectionIdToUse,
      projectId: projectIdToUse,
      authType
    });

    return { success: true };
  }

  static async deleteAllForCollection({ collectionId, projectId, userId }) {
    logger.info('Deleting all documents for collection', { collectionId, projectId, userId });

    const result = await this.document.deleteAllByCollectionId(collectionId, projectId);

    logger.info('All documents deleted for collection', { collectionId, projectId, deletedCount: result.deletedCount, userId });
    
    return { deletedCount: result.deletedCount };
  }
}