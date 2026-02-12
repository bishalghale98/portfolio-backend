import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/dbConnect';

describe('User Module Integration Tests', () => {
    // Clean up test data after all tests
    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: { contains: 'test@' } },
        });
    });

    describe('POST /api/v1/users/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.email).toBe('test@example.com');
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with short password', async () => {
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Test User',
                    email: 'test2@example.com',
                    password: '123',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Test User',
                    email: 'test3@example.com',
                    password: 'password123',
                });

            // Duplicate registration
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Test User 2',
                    email: 'test3@example.com',
                    password: 'password456',
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/v1/users/login', () => {
        beforeAll(async () => {
            // Create a test user
            await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Login Test User',
                    email: 'test-login@example.com',
                    password: 'password123',
                });
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'test-login@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('test-login@example.com');
            expect(response.headers['set-cookie']).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'test-login@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/users/profile', () => {
        let authCookie: string;

        beforeAll(async () => {
            // Register and login to get auth cookie
            await request(app)
                .post('/api/v1/users/register')
                .send({
                    name: 'Profile Test User',
                    email: 'test-profile@example.com',
                    password: 'password123',
                });

            const loginResponse = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'test-profile@example.com',
                    password: 'password123',
                });

            authCookie = loginResponse.headers['set-cookie'][0];
        });

        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/users/profile')
                .set('Cookie', authCookie);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('test-profile@example.com');
        });

        it('should fail without authentication', async () => {
            const response = await request(app).get('/api/v1/users/profile');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
