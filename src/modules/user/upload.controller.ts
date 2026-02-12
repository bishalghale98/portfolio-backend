import { Request, Response } from 'express';
import { catchError } from '../../services/catchError';
import cloudinary from '../../config/cloudinary';
import { prisma } from '../../config/dbConnect';
import { CacheService } from '../../services/cache.service';

/**
 * Upload profile picture
 * POST /api/v1/users/upload-avatar
 */
export const uploadAvatar = catchError(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }

    if (!req.file) {
        res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
        return;
    }

    // Get Cloudinary file info
    const file = req.file as Express.Multer.File & {
        path: string;
        filename: string;
    };

    // Get user's current avatar to delete old one
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarPublicId: true },
    });

    // Delete old avatar from Cloudinary if exists
    if (user?.avatarPublicId) {
        try {
            await cloudinary.uploader.destroy(user.avatarPublicId);
        } catch (error) {
            // Log error but don't fail the upload
            console.error('Failed to delete old avatar:', error);
        }
    }

    // Update user with new avatar
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            avatar: file.path,
            avatarPublicId: file.filename,
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
        },
    });

    // Invalidate user cache
    const cacheKey = CacheService.generateKey('user:profile', userId);
    await CacheService.delete(cacheKey);

    res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: updatedUser,
    });
});

/**
 * Delete profile picture
 * DELETE /api/v1/users/avatar
 */
export const deleteAvatar = catchError(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }

    // Get user's avatar info
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarPublicId: true },
    });

    if (!user?.avatarPublicId) {
        res.status(404).json({
            success: false,
            message: 'No avatar to delete',
        });
        return;
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.avatarPublicId);

    // Update user
    await prisma.user.update({
        where: { id: userId },
        data: {
            avatar: null,
            avatarPublicId: null,
        },
    });

    // Invalidate user cache
    const cacheKey = CacheService.generateKey('user:profile', userId);
    await CacheService.delete(cacheKey);

    res.status(200).json({
        success: true,
        message: 'Avatar deleted successfully',
    });
});
