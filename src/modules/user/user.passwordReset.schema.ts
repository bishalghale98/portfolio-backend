import { z } from 'zod';

/**
 * Password reset request schema
 */
export const requestPasswordResetSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Invalid email format'),
});

/**
 * Password reset schema
 */
export const resetPasswordSchema = z.object({
    token: z
        .string({
            required_error: 'Reset token is required',
        })
        .min(1, 'Reset token is required'),

    newPassword: z
        .string({
            required_error: 'New password is required',
        })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must not exceed 100 characters'),
});

// Export types
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
