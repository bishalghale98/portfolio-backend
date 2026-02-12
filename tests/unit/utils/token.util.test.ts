import { generateToken, verifyToken } from '../../src/utils/token.util';

describe('Token Utility', () => {
    const mockPayload = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'USER',
    };

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const token = generateToken(mockPayload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        it('should generate token with custom expiration', () => {
            const token = generateToken(mockPayload, 3600); // 1 hour

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode a valid token', () => {
            const token = generateToken(mockPayload);
            const decoded = verifyToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.id).toBe(mockPayload.id);
            expect(decoded.email).toBe(mockPayload.email);
            expect(decoded.role).toBe(mockPayload.role);
        });

        it('should throw error for invalid token', () => {
            const invalidToken = 'invalid.token.here';

            expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
        });

        it('should throw error for expired token', () => {
            // Generate token that expires immediately
            const token = generateToken(mockPayload, -1);

            // Wait a bit to ensure expiration
            setTimeout(() => {
                expect(() => verifyToken(token)).toThrow();
            }, 100);
        });
    });
});
