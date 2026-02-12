import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { env } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend Starter Kit API',
            version: '1.0.0',
            description: 'Production-ready Node.js + Express + TypeScript + Prisma backend API',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api/v1`,
                description: 'Development server',
            },
            {
                url: 'https://api.production.com/api/v1',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'accessToken',
                    description: 'JWT token stored in HTTP-only cookie',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        role: {
                            type: 'string',
                            enum: ['USER', 'ADMIN'],
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Users',
                description: 'User authentication and management',
            },
            {
                name: 'Health',
                description: 'Health check endpoints',
            },
        ],
    },
    apis: ['./src/modules/**/*.route.ts', './src/app.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Backend Starter Kit API Docs',
    }));

    // Swagger JSON
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
