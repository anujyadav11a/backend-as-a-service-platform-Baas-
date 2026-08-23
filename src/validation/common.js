import { z } from 'zod';

export const idParam = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const projectIdParam = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
});

export const collectionIdParam = z.object({
  collection_id: z.string().min(1, 'Collection ID is required'),
});

export const databaseIdParam = z.object({
  database_id: z.string().min(1, 'Database ID is required').regex(/^\d+$/, 'Database ID must be a number'),
});

export const attributeIdParam = z.object({
  attribute_id: z.string().min(1, 'Attribute ID is required'),
});

export const documentIdParam = z.object({
  document_id: z.string().min(1, 'Document ID is required'),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const searchQuery = z.object({
  query: z.string().min(1, 'Search query is required'),
});