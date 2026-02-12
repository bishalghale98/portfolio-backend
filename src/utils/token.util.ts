import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Token payload interface
 */
export interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

/**
 * Generate access token (short-lived)
 * @param payload - Token payload
 * @returns JWT access token
 */
export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(
        payload,
        env.JWT_SECRET,
        { expiresIn: (env.ACCESS_TOKEN_EXPIRY || '15m') as any }
    );
};

/**
 * Generate refresh token (long-lived)
 * @param payload - Token payload
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(
        payload,
        env.JWT_SECRET,
        { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as any }
    );
};

/**
 * Verify and decode token
 * @param token - JWT token
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Hash refresh token for storage
 * @param token - Refresh token
 * @returns Hashed token
 */
export const hashRefreshToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Get refresh token expiry date
 * @returns Expiry date
 */
export const getRefreshTokenExpiry = (): Date => {
    const days = parseInt(process.env.REFRESH_TOKEN_EXPIRY?.replace('d', '') || '7', 10);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
