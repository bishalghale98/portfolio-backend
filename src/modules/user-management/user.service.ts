import { prisma } from '../../config/dbConnect';
import { Prisma, Role } from '@prisma/client';

/**
 * Get all users with pagination and search
 */
export const getAllUsers = async (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
        deletedAt: null,
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Get user details by ID
 */
export const getUserById = async (id: string) => {
    return await prisma.user.findFirst({
        where: { id, deletedAt: null },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

/**
 * Update user role
 */
export const updateUserRole = async (id: string, role: Role) => {
    return await prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
};

/**
 * Soft delete user
 */
export const deleteUser = async (id: string) => {
    return await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
};
