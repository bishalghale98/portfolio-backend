import { Response } from "express";

interface ResponseProps {
    res: Response;         // Add Express response object
    success?: boolean;
    data?: any;
    message?: string;
    statusCode?: number;
}

// Success response
export const successResponse = ({
    res,
    success = true,
    data,
    message,
    statusCode = 200,
}: ResponseProps) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};

// Error response
export const errorResponse = ({
    res,
    success = false,
    data,
    message,
    statusCode = 500,
}: ResponseProps) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};
