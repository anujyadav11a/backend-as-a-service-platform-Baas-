import { z } from 'zod';

export const createCollectionSchema = z.object({
  params: z.object({
    database_id: z.string().min(1, 'Database ID is required').regex(/^\d+$/, 'Database ID must be a number'),
  }),
  body: z.object({
    name: z.string().min(1, 'Collection name is required').max(255, 'Collection name must be at most 255 characters'),
  }),
});

export const deleteCollectionSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
  }),
});

export const listCollectionsSchema = z.object({
  params: z.object({
    database_id: z.string().min(1, 'Database ID is required').regex(/^\d+$/, 'Database ID must be a number'),
  }),
});