import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserById } from './user.model';
import { generateToken, generateRefreshToken } from '../../utils/token.util';
import { catchError } from '../../services/catchError';
import { sendWelcomeEmail } from '../../services/email.service';
import { logger } from '../../config/logger';
import { CacheService } from '../../services/cache.service';
import { clearRefreshToken, storeRefreshToken } from './refreshToken.model';

/**
 * Register a new user
 * POST /api/users/register
 */
export const register = catchError(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        res.status(409).json({
            success: false,
            message: 'User with this email already exists',
        });
        return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
        name,
        email,
        password: hashedPassword,
    });

    // Send welcome email (async, don't block response)
    sendWelcomeEmail(user.email, user.name).catch((error) => {
        logger.error('Failed to send welcome email', error);
    });


    // Send response
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
    });
});

/**
 * Login user
 * POST /api/users/login
 */
export const login = catchError(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 1. Find user
    const user = await findUserByEmail(email);
    if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
    }

    console.log("User found", user , "password", password)




    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    // 3. Generate tokens
    const accessToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    // 4. Store refresh token in DB
    await storeRefreshToken(user.id, refreshToken);

    /**
     * 5. SET COOKIE
     * domain allows subdomains (app + api)
     */
    process.env.NODE_ENV === "production" ? res.cookie("accessToken", accessToken, {
        httpOnly: true, // JS can't read it
        secure: true, // HTTPS only
        sameSite: "none", // cross-site allowed
        domain: ".dineshbudhathoki1.com.np", // share across subdomains
        maxAge: 15 * 60 * 1000, // 15 minutes
    }) : res.cookie("accessToken", accessToken, {
        httpOnly: true, // JS can't read it
        secure: false, // HTTPS only
        sameSite: "lax", // cross-site allowed
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // 6. Send response (NO TOKEN IN BODY)
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            accessToken,
            refreshToken,
        },
    });
});

/**
 * Get authenticated user profile
 * GET /api/users/profile
 */
export const getProfile = catchError(async (req: Request, res: Response) => {
    // User info is attached by auth middleware
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
        return;
    }

    // Check cache first
    const cacheKey = CacheService.generateKey('user:profile', userId);
    const cachedUser = await CacheService.get(cacheKey);

    if (cachedUser) {
        res.setHeader('X-Cache', 'HIT');
        res.status(200).json({
            success: true,
            data: cachedUser,
        });
        return;
    }

    // Find user by ID
    const user = await findUserById(userId);

    if (!user) {
        res.status(404).json({
            success: false,
            message: 'User not found',
        });
        return;
    }

    // Prepare user data (exclude password)
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
    };

    // Cache user profile for 5 minutes
    await CacheService.set(cacheKey, userData, 300);

    // Send response
    res.setHeader('X-Cache', 'MISS');
    res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: userData,
    });
});

/**
 * Logout user
 * POST /api/users/logout
 */
export const logout = catchError(async (_req: Request, res: Response) => {
    // Clear cookie
    await clearRefreshToken(_req.user?.id as string);

    /**
     * MUST MATCH SAME OPTIONS AS res.cookie
     */

    process.env.NODE_ENV === "production" ? res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".dineshbudhathoki1.com.np",
    }) : res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        domain: '',
    });


    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});
