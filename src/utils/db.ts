import { PrismaClient } from '@prisma/client';

// Create a singleton instance of the Prisma client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Export the prisma instance
export default prisma; 