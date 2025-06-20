import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError | ZodError | PrismaClientKnownRequestError | PrismaClientValidationError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    res.status(statusCode).json({
      error: message,
      details: errors
    });
    return;
  }

  // Handle Prisma unique constraint violations
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this information already exists';
      
      // Provide more specific message for username conflicts
      if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('username')) {
        message = 'Username already exists';
      }
    } else if (error.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database operation failed';
    }
    
    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
    return;
  }

  // Handle Prisma validation errors
  if (error instanceof PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    
    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
    return;
  }

  // Handle custom app errors
  if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
} 