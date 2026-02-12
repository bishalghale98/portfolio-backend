// import Redis from 'ioredis';
// import { logger } from './logger';

/**
 * Redis client configuration
 * Singleton pattern to ensure single connection
 * 
 * NOTE: Redis is currently disabled. Uncomment to enable caching.
 */

// Commented out - Redis not installed
/*
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
    logger.success('Redis client connected');
});

redis.on('ready', () => {
    logger.success('Redis client ready');
});

redis.on('error', (error) => {
    logger.error('Redis connection error', error);
});

redis.on('close', () => {
    logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
    logger.info('Redis client reconnecting');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await redis.quit();
    logger.info('Redis connection closed through app termination');
});
*/

// Mock Redis client for when Redis is disabled
export const redis = {
    status: 'disabled',
} as any;

export default redis;
