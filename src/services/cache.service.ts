import { redis } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Cache service for Redis operations
 * Provides generic caching functionality
 */

export class CacheService {
    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or null
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;

            return JSON.parse(data) as T;
        } catch (error) {
            logger.error(`Cache get error for key: ${key}`, error);
            return null;
        }
    }

    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
     */
    static async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            logger.error(`Cache set error for key: ${key}`, error);
        }
    }

    /**
     * Delete value from cache
     * @param key - Cache key
     */
    static async delete(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            logger.error(`Cache delete error for key: ${key}`, error);
        }
    }

    /**
     * Delete multiple keys matching a pattern
     * @param pattern - Key pattern (e.g., 'user:*')
     */
    static async deletePattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            logger.error(`Cache delete pattern error for: ${pattern}`, error);
        }
    }

    /**
     * Clear all cache
     */
    static async clear(): Promise<void> {
        try {
            await redis.flushdb();
            logger.info('Cache cleared');
        } catch (error) {
            logger.error('Cache clear error', error);
        }
    }

    /**
     * Check if key exists
     * @param key - Cache key
     * @returns True if exists
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Cache exists error for key: ${key}`, error);
            return false;
        }
    }

    /**
     * Get remaining TTL for a key
     * @param key - Cache key
     * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
     */
    static async ttl(key: string): Promise<number> {
        try {
            return await redis.ttl(key);
        } catch (error) {
            logger.error(`Cache TTL error for key: ${key}`, error);
            return -2;
        }
    }

    /**
     * Generate cache key
     * @param prefix - Key prefix
     * @param identifier - Unique identifier
     * @returns Cache key
     */
    static generateKey(prefix: string, identifier: string | number): string {
        return `${prefix}:${identifier}`;
    }
}

export default CacheService;
