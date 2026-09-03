import { mysqlPool } from '../../../shared/config/db.js';
import { createDatabaseRepository } from './DatabaseRepository.js';
import { createCollectionRepository } from './CollectionRepository.js';
import { createAttributeRepository } from './AttributeRepository.js';
import { createDocumentRepository } from './DocumentRepository.js';

const repositories = {
  database: null,
  collection: null,
  attribute: null,
  document: null,
};

export const initializeRepositories = (pool = mysqlPool) => {
  repositories.database = createDatabaseRepository(pool);
  repositories.collection = createCollectionRepository(pool);
  repositories.attribute = createAttributeRepository(pool);
  repositories.document = createDocumentRepository(pool);
  return repositories;
};

export const getRepositories = () => repositories;

export const setRepository = (name, repo) => {
  repositories[name] = repo;
};

export const resetRepositories = () => {
  repositories.database = null;
  repositories.collection = null;
  repositories.attribute = null;
  repositories.document = null;
};