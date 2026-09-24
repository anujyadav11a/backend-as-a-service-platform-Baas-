import { z, ZodError } from 'zod';
import { ApiError } from '../utils/apierror.js';

/**
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
      if (validated.body !== undefined) req.body = validated.body;
      // Note: req.query and req.params are read-only in Express, skip reassignment
      // Controllers should use req.query / req.params directly
      if (validated.headers !== undefined) req.headers = validated.headers;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error.issues || error.errors).map(err => ({
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
export const validateBody = (schema) => validate(z.object({ body: schema }));

/**
 * Validate only request params
 */
export const validateParams = (schema) => validate(z.object({ params: schema }));

/**
 * Validate only request query
 */
export const validateQuery = (schema) => validate(z.object({ query: schema }));