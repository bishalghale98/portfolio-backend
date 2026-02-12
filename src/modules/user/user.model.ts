import { prisma } from '../../config/dbConnect';
import { User, Role } from '@prisma/client';

/**
 * Create a new user in the database
 * @param data - User data (name, email, password)
 * @returns Created user object
 */
export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
}): Promise<User> => {
    return await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || 'USER',
        },
    });
};

/**
 * Find user by email
 * @param email - User email
 * @returns User object or null
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findFirst({
        where: { email },
    });
};

/**
 * Find user by ID
 * @param id - User ID
 * @returns User object or null
 */
export const findUserById = async (id: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { id },
    });
};

/**
 * Update user by ID
 * @param id - User ID
 * @param data - Updated user data
 * @returns Updated user object
 */
export const updateUser = async (
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};
