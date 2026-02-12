import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Zod schema validation middleware
 * Validates request body against provided Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateSchema = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate request body
            await schema.parseAsync(req.body);
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format validation errors
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
            }

            // Pass other errors to error handler
            return next(error);
        }
    };
};
