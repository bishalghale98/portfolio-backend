import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';
import { logger } from '../config/logger';

/**
 * Cache middleware for API responses
 * Caches GET requests based on URL
 */
export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key from URL
        const cacheKey = `cache:${req.originalUrl}`;

        try {
            // Check if cached response exists
            const cachedResponse = await CacheService.get(cacheKey);

            if (cachedResponse) {
                logger.info(`Cache hit: ${cacheKey}`);
                res.setHeader('X-Cache', 'HIT');
                return res.json(cachedResponse);
            }

            // Cache miss - store original res.json
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = function (body: any) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    CacheService.set(cacheKey, body, ttl).catch((error) => {
                        logger.error('Failed to cache response', error);
                    });
                }

                res.setHeader('X-Cache', 'MISS');
                return originalJson(body);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error', error);
            next();
        }
    };
};

/**
 * Invalidate cache for specific pattern
 * @param pattern - Cache key pattern
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
    await CacheService.deletePattern(pattern);
    logger.info(`Cache invalidated: ${pattern}`);
};

export default cacheMiddleware;
