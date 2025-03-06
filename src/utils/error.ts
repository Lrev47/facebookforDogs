import { ErrorType, AppError } from '../types';

/**
 * Custom error class that extends Error and provides additional information
 */
export class CustomError extends Error implements AppError {
  type: ErrorType;
  statusCode: number;
  isOperational: boolean;
  details?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL_SERVER,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    // This captures the proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Factory functions for creating specific error types
export const createBadRequestError = (message: string, details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.BAD_REQUEST, 400, true, details);
};

export const createUnauthorizedError = (message: string = 'Unauthorized', details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.UNAUTHORIZED, 401, true, details);
};

export const createForbiddenError = (message: string = 'Forbidden', details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.FORBIDDEN, 403, true, details);
};

export const createNotFoundError = (message: string = 'Resource not found', details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.NOT_FOUND, 404, true, details);
};

export const createConflictError = (message: string, details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.CONFLICT, 409, true, details);
};

export const createValidationError = (message: string, details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.VALIDATION, 422, true, details);
};

export const createInternalServerError = (message: string = 'Internal server error', details?: Record<string, any>): CustomError => {
  return new CustomError(message, ErrorType.INTERNAL_SERVER, 500, true, details);
}; 