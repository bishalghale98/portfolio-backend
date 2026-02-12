import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

/**
 * Cloudinary storage configuration for Multer
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req: Request, _file: Express.Multer.File) => {
        return {
            folder: process.env.CLOUDINARY_FOLDER || 'portfolio/images',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        };
    },
});

/**
 * File filter to validate file types
 */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

/**
 * Multer upload middleware
 */
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    },
    fileFilter: fileFilter,
});

export default upload;
