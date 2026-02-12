import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail } from './user.model';
import { generateResetToken, findUserByResetToken, clearResetToken } from './user.passwordReset.model';
import { sendPasswordResetEmail } from '../../services/email.service';
import { catchError } from '../../services/catchError';
import { prisma } from '../../config/dbConnect';

/**
 * Request password reset
 * POST /api/v1/users/forgot-password
 */
export const requestPasswordReset = catchError(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find user
    const user = await findUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
        return;
    }

    // Generate reset token
    const resetToken = await generateResetToken(user.id);

    // Send reset email
    try {
        await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (error) {
        // Clear token if email fails
        await clearResetToken(user.id);
        res.status(500).json({
            success: false,
            message: 'Failed to send password reset email. Please try again later.',
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email.',
    });
});

/**
 * Reset password
 * POST /api/v1/users/reset-password
 */
export const resetPassword = catchError(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Find user by token
    const user = await findUserByResetToken(token);

    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token.',
        });
        return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });

    res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
    });
});
