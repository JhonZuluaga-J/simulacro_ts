import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { ENV } from "@/lib/config/envValidator";
import { DatabaseError } from "@/lib/errors";

const extractErrorContext = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }
  return { error: String(error) };
};

const createPrismaClient = (): PrismaClient => {
  try {
    const pool = new Pool({ connectionString: ENV.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    const context = extractErrorContext(error);
    throw new DatabaseError("Failed to initialize Prisma client", context);
  }
};

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (ENV.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
