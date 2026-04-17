let prisma: any = null;

if (typeof window === 'undefined') {
  try {
    const { PrismaClient } = require('@prisma/client');
    const globalForPrisma = global as unknown as { prisma: any };

    prisma =
      globalForPrisma.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });

    if (process.env.NODE_ENV !== 'production') {
      (global as any).prisma = prisma;
    }
  } catch (e) {
    console.error('Prisma initialization failed:', e);
  }
}

export { prisma };
