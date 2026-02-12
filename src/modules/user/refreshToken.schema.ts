import { z } from 'zod';

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
    refreshToken: z
        .string({
            required_error: 'Refresh token is required',
        })
        .min(1, 'Refresh token is required'),
});

// Export type
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
