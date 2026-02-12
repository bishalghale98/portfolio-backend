import { Request, Response, NextFunction } from 'express';
import { catchError } from '../../../src/services/catchError';

describe('CatchError Service', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    it('should call the async function and handle success', async () => {
        const asyncFn = jest.fn().mockResolvedValue('success');
        const wrappedFn = catchError(asyncFn);

        await wrappedFn(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next middleware', async () => {
        const error = new Error('Test error');
        const asyncFn = jest.fn().mockRejectedValue(error);
        const wrappedFn = catchError(asyncFn);

        await wrappedFn(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(asyncFn).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors', async () => {
        const error = new Error('Sync error');
        const asyncFn = jest.fn().mockImplementation(() => {
            throw error;
        });
        const wrappedFn = catchError(asyncFn);

        await wrappedFn(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(error);
    });
});
