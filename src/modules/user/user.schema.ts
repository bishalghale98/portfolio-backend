import { z } from 'zod';

/**
 * User registration schema
 * Validates name, email, and password
 */
export const registerSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
        })
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters'),

    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Invalid email format'),

    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must not exceed 100 characters'),
});

/**
 * User login schema
 * Validates email and password
 */
export const loginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Invalid email format'),

    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(1, 'Password is required'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
