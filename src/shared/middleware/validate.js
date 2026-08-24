import { ZodError } from 'zod';
import { ApiError } from '../utils/apierror.js';

/**
 * Generic validation middleware using Zod schemas
 * @param {Object} schema - Zod schema object with optional body, params, query, headers properties
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const dataToValidate = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      };

      // Validate against the schema
      const validated = await schema.parseAsync(dataToValidate);
      
      // Replace request properties with validated data
      if (validated.body) req.body = validated.body;
      if (validated.params) req.params = validated.params;
      if (validated.query) req.query = validated.query;
      if (validated.headers) req.headers = validated.headers;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return next(ApiError.badRequest('Validation failed', errors));
      }
      
      next(error);
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema) => validate({ body: schema });

/**
 * Validate only request params
 */
export const validateParams = (schema) => validate({ params: schema });

/**
 * Validate only request query
 */
export const validateQuery = (schema) => validate({ query: schema });