import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fall back to a placeholder connection string so the Prisma client can be
// instantiated even when DATABASE_URL is not configured (e.g. building or
// deploying the demo without a database). Queries then fail gracefully at
// runtime and the app falls back to its static / default content.
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://user:password@localhost:5432/placeholder?schema=public';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
