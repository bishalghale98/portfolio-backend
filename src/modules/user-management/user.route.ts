import { Router } from 'express';
import { getUsers, getUser, updateUserRole, deleteUser } from './user.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const userManagementRouter = Router();

// Optimize: Group middleware
userManagementRouter.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * tags:
 *   name: UserManagement
 *   description: Admin user management endpoints
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [UserManagement]
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users
 */
userManagementRouter.get('/', getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [UserManagement]
 *     summary: Get user details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
userManagementRouter.get('/:id', getUser);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     tags: [UserManagement]
 *     summary: Update user role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 */
userManagementRouter.put('/:id/role', updateUserRole);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [UserManagement]
 *     summary: Delete user (Soft)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
userManagementRouter.delete('/:id', deleteUser);

export default userManagementRouter;
