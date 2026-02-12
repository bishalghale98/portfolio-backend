import { Request, Response } from 'express';
import { findUserByRefreshToken, storeRefreshToken } from './refreshToken.model';
import { generateToken, generateRefreshToken, verifyToken } from '../../utils/token.util';
import { catchError } from '../../services/catchError';
import { CacheService } from '../../services/cache.service';

/**
 * Refresh access token
 * POST /api/v1/users/refresh-token
 */
export const refreshAccessToken = catchError(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(401).json({
            success: false,
            message: 'Refresh token is required',
        });
        return;
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = verifyToken(refreshToken);
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token',
        });
        return;
    }

    // Find user by refresh token
    const user = await findUserByRefreshToken(refreshToken);

    if (!user || user.id !== decoded.id) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
        return;
    }

    // Generate new tokens
    const newAccessToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    // Store new refresh token (token rotation)
    await storeRefreshToken(user.id, newRefreshToken);

    // Invalidate user cache
    const cacheKey = CacheService.generateKey('user:profile', user.id);
    await CacheService.delete(cacheKey);

    // Set new access token in cookie
    res.cookie("accessToken", newAccessToken, {
        httpOnly: true, // JS can't read it
        secure: true, // HTTPS only
        sameSite: "none", // cross-site allowed
        domain: ".dineshbudhathoki1.com.np", // share across subdomains
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Send response with new refresh token
    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        },
    });
});
