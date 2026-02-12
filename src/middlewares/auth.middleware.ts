import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.util';

/**
 * Authentication middleware
 * Verifies JWT token from cookie and attaches user info to request
 * Blocks unauthorized requests
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from cookie
        const token = req.cookies?.accessToken;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.',
            });
            return;
        }


        // Verify token
        const decoded = verifyToken(token);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.',
        });
    }
};

/**
 * Authorization middleware
 * Restricts access to specific roles
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden. Insufficient permissions.',
            });
            return;
        }
        next();
    };
};
