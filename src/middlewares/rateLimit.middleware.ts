import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits requests to prevent abuse
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        errors: [],
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.',
        errors: [],
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Moderate rate limiter for general routes
 */
export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    message: {
        success: false,
        message: 'Too many requests, please slow down.',
        errors: [],
    },
    standardHeaders: true,
    legacyHeaders: false,
});
