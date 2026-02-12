import { Router } from 'express';
import { login, getProfile, logout } from './user.controller';
import { requestPasswordReset, resetPassword } from './user.passwordReset.controller';
import { refreshAccessToken } from './refreshToken.controller';
import { uploadAvatar, deleteAvatar } from './upload.controller';
import { validateSchema } from '../../middlewares/validateSchema';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimit.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { loginSchema } from './user.schema';
import { requestPasswordResetSchema, resetPasswordSchema } from './user.passwordReset.schema';
import { refreshTokenSchema } from './refreshToken.schema';

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and management
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 */
// userRouter.post('/register', authLimiter, validateSchema(registerSchema), register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     description: Authenticate user and return JWT token in cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
userRouter.post('/login', authLimiter, validateSchema(loginSchema), login);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     description: Get authenticated user's profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
userRouter.get('/profile', authenticate, getProfile);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout user
 *     description: Clear authentication cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/logout', authenticate, logout);

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent (or user not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to send email
 */
userRouter.post('/forgot-password', validateSchema(requestPasswordResetSchema), requestPasswordReset);

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     tags: [Users]
 *     summary: Reset password with token
 *     description: Reset user password using the reset token from email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
userRouter.post('/reset-password', validateSchema(resetPasswordSchema), resetPassword);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     tags: [Users]
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
userRouter.post('/refresh-token', validateSchema(refreshTokenSchema), refreshAccessToken);

/**
 * @swagger
 * /users/upload-avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload profile picture
 *     description: Upload or update user avatar (Cloudinary)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);

/**
 * @swagger
 * /users/avatar:
 *   delete:
 *     tags: [Users]
 *     summary: Delete profile picture
 *     description: Delete user avatar from Cloudinary
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No avatar to delete
 */
userRouter.delete('/avatar', authenticate, deleteAvatar);

export default userRouter;

