import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps a controller function to ensure compatibility with Express's type system
 * This resolves the type mismatch between our controller return types and what Express expects
 */
export const asyncHandler = <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<any>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}; 