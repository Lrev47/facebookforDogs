import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { CustomError } from '../utils/error';
import { ErrorType, ApiResponse } from '../types';

/**
 * Global error handling middleware
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ...(err instanceof CustomError ? { 
      type: err.type,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      details: err.details
    } : {})
  });

  // If the error is a CustomError, use its status code and type
  if (err instanceof CustomError) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        message: err.message,
        type: err.type,
        details: err.details
      }
    };
    
    res.status(err.statusCode).json(response);
    return;
  }

  // For unhandled errors, return a generic server error
  const response: ApiResponse<null> = {
    success: false,
    error: {
      message: 'Internal server error',
      type: ErrorType.INTERNAL_SERVER
    }
  };
  
  res.status(500).json(response);
};

/**
 * Handle 404 errors for routes that don't exist
 */
export const notFoundHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      type: ErrorType.NOT_FOUND
    }
  };
  
  res.status(404).json(response);
}; 