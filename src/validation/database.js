import { z } from 'zod';

export const createDatabaseSchema = z.object({
  params: z.object({
    project_id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'Database name is required').max(255, 'Database name must be at most 255 characters'),
  }),
});

export const deleteDatabaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Database ID is required'),
  }),
});

export const listDatabasesSchema = z.object({
  params: z.object({
    project_id: z.string().min(1, 'Project ID is required'),
  }),
});

export const getDatabaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Database ID is required'),
  }),
});