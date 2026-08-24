import { z } from 'zod';

export const addDocumentSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
  }),
  body: z.object({
    data: z.record(z.unknown(), 'Data must be a valid JSON object').refine(
      obj => obj !== null && typeof obj === 'object' && !Array.isArray(obj),
      'Data must be a valid JSON object (not array or null)'
    ),
  }),
});

export const getDocumentsSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const queryDocumentsSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
  }),
  body: z.object({
    filters: z.array(z.object({
      field: z.string().min(1, 'Filter field is required'),
      operator: z.enum([
        'equals', 'notEquals',
        'greaterThan', 'greaterThanOrEqual',
        'lessThan', 'lessThanOrEqual',
        'contains', 'notContains',
        'startsWith', 'endsWith',
        'in', 'notIn',
        'isNull', 'isNotNull',
      ]),
      value: z.unknown().optional(),
    })).default([]),
    sort: z.object({
      field: z.string().min(1, 'Sort field is required'),
      order: z.enum(['asc', 'desc']).default('desc'),
    }).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const getDocumentByIdSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
    document_id: z.string().min(1, 'Document ID is required'),
  }),
});

export const updateDocumentSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
    document_id: z.string().min(1, 'Document ID is required'),
  }),
  body: z.object({
    data: z.record(z.unknown(), 'Data must be a valid JSON object').refine(
      obj => obj !== null && typeof obj === 'object' && !Array.isArray(obj),
      'Data must be a valid JSON object (not array or null)'
    ),
  }),
});

export const deleteDocumentSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
    document_id: z.string().min(1, 'Document ID is required'),
  }),
});