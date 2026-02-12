import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Centralized error handling middleware
 * Catches all errors and sends unified response format
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal server error';
    let errors: any[] = [];

    // Handle custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle other known errors
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Handle Prisma errors
    else if (err.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        message = 'Database operation failed';
    } else if (err.name === 'PrismaClientValidationError') {
        statusCode = 400;
        message = 'Invalid data provided';
    }

    // Log error details
    logger.error(`${req.method} ${req.path}`, {
        error: message,
        statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    logger.warn(`Route not found: ${req.method} ${req.path}`);

    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        errors: [],
    });
};
