import { env } from './src/config/env';
import { logger } from './src/config/logger';
import app from './src/app';
import { dbConnect } from './src/config/dbConnect';

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await dbConnect();

        // Start Express server
        app.listen(env.PORT, () => {
            logger.success(`Server is running on port ${env.PORT}`);
            logger.info(`Health check: http://localhost:${env.PORT}/health`);
            logger.info(`API base URL: http://localhost:${env.PORT}/api/v1`);
        });
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();

