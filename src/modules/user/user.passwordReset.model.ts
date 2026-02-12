import { prisma } from '../../config/dbConnect';
import { User } from '@prisma/client';
import crypto from 'crypto';

/**
 * Generate password reset token
 * @param userId - User ID
 * @returns Reset token
 */
export const generateResetToken = async (userId: string): Promise<string> => {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token for storage
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with reset token
    await prisma.user.update({
        where: { id: userId },
        data: {
            resetToken: hashedToken,
            resetTokenExpiry,
        },
    });

    // Return unhashed token (to send in email)
    return resetToken;
};

/**
 * Find user by reset token
 * @param token - Reset token
 * @returns User or null
 */
export const findUserByResetToken = async (token: string): Promise<User | null> => {
    // Hash the token to match stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with valid token
    return await prisma.user.findFirst({
        where: {
            resetToken: hashedToken,
            resetTokenExpiry: {
                gt: new Date(), // Token not expired
            },
        },
    });
};

/**
 * Clear reset token
 * @param userId - User ID
 */
export const clearResetToken = async (userId: string): Promise<void> => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
};
