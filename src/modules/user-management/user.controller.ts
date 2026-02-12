import { Request, Response } from 'express';
import * as userService from './user.service';
import { Role } from '@prisma/client';
import { catchError } from '../../services/catchError';

/**
 * Get all users (Admin only)
 */
export const getUsers = catchError(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const result = await userService.getAllUsers(page, limit, search);

    res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});

/**
 * Get single user by ID
 */
export const getUser = catchError(async (req: Request, res: Response): Promise<void> => {

    const { id } = req.params;
    const user = await userService.getUserById(id as string);

    if (!user) {
        res.status(404).json({
            success: false,
            message: 'User not found',
        });
        return;
    }

    res.status(200).json({
        success: true,
        data: user,
    });

})

/**
 * Update user role
 */
export const updateUserRole = catchError(async (req: Request, res: Response): Promise<void> => {

    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(Role).includes(role)) {
        res.status(400).json({
            success: false,
            message: 'Invalid role provided',
        });
        return;
    }

    const updatedUser = await userService.updateUserRole(id as string, role as Role);

    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
    });

})

/**
 * Delete user (Soft delete)
 */
export const deleteUser = catchError(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user?.id === id) {
            res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
            return;
        }

        await userService.deleteUser(id as string);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
})
