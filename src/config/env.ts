import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at startup
 */

interface EnvConfig {
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
    CORS_ORIGIN: string[];
}

/**
 * Validate and parse environment variables
 * @throws Error if required variables are missing
 */
const validateEnv = (): EnvConfig => {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file and ensure all required variables are set.'
        );
    }

    return {
        PORT: parseInt(process.env.PORT || '5000', 10),
        DATABASE_URL: process.env.DATABASE_URL!,
        JWT_SECRET: process.env.JWT_SECRET!,
        NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
        ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
        CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'https://app.dineshbudhathoki1.com.np'],
    };
};

// Validate and export environment configuration
export const env = validateEnv();

// Log environment info (without sensitive data)
console.log('🔧 Environment:', env.NODE_ENV);
console.log('🌐 Port:', env.PORT);
console.log('🔑 Access Token Expiry:', env.ACCESS_TOKEN_EXPIRY);
console.log('🔑 Refresh Token Expiry:', env.REFRESH_TOKEN_EXPIRY);
