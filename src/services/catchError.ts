import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Async error wrapper utility
 * Wraps async controller functions to catch errors and pass to Express error handler
 * Eliminates need for try/catch in every controller
 * 
 * @param fn - Async controller function
 * @returns Wrapped function with error handling
 */
export const catchError = (fn: AsyncFunction) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
