import { PrismaClient } from "@prisma/client";

// Singleton pattern — reuse one Prisma instance instead of creating a new one
// on every hot reload during development (would exhaust DB connections fast)
// Real world example: like keeping one DB connection pool open instead of
// opening a new connection for every request
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
