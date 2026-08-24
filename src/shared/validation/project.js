import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name must be at most 100 characters'),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name must be at most 100 characters').optional(),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  }).refine(data => data.name !== undefined || data.description !== undefined, {
    message: 'At least one field (name or description) must be provided',
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});

export const searchProjectsSchema = z.object({
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
  }),
});

export const generateApiKeySchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Project slug is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'API key name is required').max(100, 'API key name must be at most 100 characters'),
    permissions: z.array(z.enum(['read', 'write', 'admin'])).default(['read']),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});