import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { logger } from './logger'

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaPg({ connectionString })

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}



export const dbConnect = async () => {
  try {
    await prisma.$connect();
    logger.success('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
  }
}