import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create connection pool for tests
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Mock Prisma Client for tests with adapter
export const prisma = new PrismaClient({ adapter });

// Setup runs before all tests
beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
});

// Cleanup runs after all tests
afterAll(async () => {
    // Disconnect from database
    await prisma.$disconnect();
    await pool.end();
});

// Clear database between tests (optional)
beforeEach(async () => {
    // You can clear specific tables here if needed
    // await prisma.user.deleteMany();
});
