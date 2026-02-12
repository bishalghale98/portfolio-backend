import { prisma } from '../../config/dbConnect';
import { User } from '@prisma/client';
import { hashRefreshToken, getRefreshTokenExpiry } from '../../utils/token.util';

/**
 * Store refresh token in database
 * @param userId - User ID
 * @param refreshToken - Refresh token (will be hashed)
 */
export const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
    const hashedToken = hashRefreshToken(refreshToken);
    const expiry = getRefreshTokenExpiry();

    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshToken: hashedToken,
            refreshTokenExpiry: expiry,
        },
    });
};

/**
 * Find user by refresh token
 * @param refreshToken - Refresh token
 * @returns User or null
 */
export const findUserByRefreshToken = async (refreshToken: string): Promise<User | null> => {
    const hashedToken = hashRefreshToken(refreshToken);

    return await prisma.user.findFirst({
        where: {
            refreshToken: hashedToken,
            refreshTokenExpiry: {
                gt: new Date(), // Token not expired
            },
        },
    });
};

/**
 * Clear refresh token
 * @param userId - User ID
 */
export const clearRefreshToken = async (userId: string): Promise<void> => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshToken: null,
            refreshTokenExpiry: null,
        },
    });
};
