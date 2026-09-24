import { authSchemas } from './auth.js';
import { projectSchemas } from './project.js';
import { databaseSchemas } from './database.js';
import { collectionSchemas } from './collection.js';
import { attributeSchemas } from './attribute.js';
import { documentSchemas } from './document.js';

export const schemas = {
  ...authSchemas,
  ...projectSchemas,
  ...databaseSchemas,
  ...collectionSchemas,
  ...attributeSchemas,
  ...documentSchemas
};