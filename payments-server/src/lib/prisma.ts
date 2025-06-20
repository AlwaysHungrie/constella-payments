import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // PostgreSQL connection pooling configuration
  ...(process.env.DATABASE_POOL_MIN && process.env.DATABASE_POOL_MAX && {
    __internal: {
      engine: {
        connectionLimit: parseInt(process.env.DATABASE_POOL_MAX),
        pool: {
          min: parseInt(process.env.DATABASE_POOL_MIN),
          max: parseInt(process.env.DATABASE_POOL_MAX),
        },
      },
    },
  }),
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma; 