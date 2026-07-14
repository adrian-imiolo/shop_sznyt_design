/**
 * Shared bootstrap for the DB-backed suite (npm run test:db). Single source
 * for how tests reach the test database and reset commerce state between
 * cases. One-time setup: `npm run test:db:prepare`.
 */
import "dotenv/config"; // vitest doesn't load backend/.env into process.env
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveTestDatabaseUrl } from "../scripts/test-db-url.js";

export function createTestPrisma(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: resolveTestDatabaseUrl() }),
  });
}

/** Full commerce-state reset — the suite runs single-threaded, so a global truncate is safe. */
export async function truncateCommerceTables(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "OrderItem", "Order", "Product" RESTART IDENTITY CASCADE',
  );
}
