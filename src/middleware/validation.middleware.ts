import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { createValidationError } from '../utils/error';

/**
 * Middleware factory for request validation using Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate ('body', 'query', 'params')
 */
export const validate = <T extends ZodType>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req[source]);
      // Replace the request data with the validated and transformed result
      req[source] = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const details: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.') || 'unknown';
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(err.message);
        });
        
        const message = 'Validation failed';
        return next(createValidationError(message, details));
      }
      
      next(error);
    }
  };
}; 