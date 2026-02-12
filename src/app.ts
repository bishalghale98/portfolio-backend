import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { logger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import mainRouter from './routes';
import { env } from './config/env';
import { prisma } from './config/dbConnect';



// Create Express application
const app: Application = express();


// Trust proxy - MUST be set before rate limiting
// Required for Render, Heroku, and other reverse proxies
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet()); // Set security HTTP headers

const origin = env.CORS_ORIGIN

app.use(
    cors({
        origin: origin,
        credentials: true, // Allow cookies to be sent
    })
);

// Body Parsing Middlewares
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Rate Limiting
app.use(apiLimiter); // Apply rate limiting to all routes

// Request Logging Middleware
app.use((req: Request, _res: Response, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Swagger API Documentation
setupSwagger(app);

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns server health status
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 environment:
 *                   type: string
 */
// Health check route
app.get('/health', async (_req: Request, res: Response) => {
    try {
        // Check Redis connection
        const { redis } = await import('./config/redis');
        const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';
        const users = await prisma.user.findMany({ take: 1 })

        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            users,
            services: {
                database: 'connected',
                redis: redisStatus,
            },
        });
    } catch (error) {
        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'not configured',
            },
        });
    }
});

// API routes - Base path: /api/v1
app.use('/api/v1', mainRouter);

// 404 handler - Must be after all routes
app.use(notFoundHandler);

// Error handler - Must be last
app.use(errorHandler);

// Export app (do not call listen here)
export default app;

