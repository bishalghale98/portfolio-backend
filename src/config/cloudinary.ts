import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

/**
 * Cloudinary configuration
 * Configure cloud storage for file uploads
 */

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
const testConnection = async () => {
    try {
        await cloudinary.api.ping();
        logger.success('Cloudinary connected successfully');
    } catch (error) {
        logger.warn('Cloudinary connection failed - file upload may not work');
    }
};

// Test connection on startup (non-blocking)
testConnection();

export default cloudinary;
