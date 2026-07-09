/**
 * DB-backed suite (npm run test:db) — proves the order-intake invariants
 * against a real Postgres: atomic stock decrement and stripeSessionId
 * idempotency. One-time setup: `npm run test:db:prepare`.
 */
import "dotenv/config"; // vitest doesn't load backend/.env into process.env
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { recordPaidOrder } from "./recordPaidOrder.ts";
import type { PaidOrderFacts } from "./types.ts";
import { resolveTestDatabaseUrl } from "../scripts/test-db-url.js";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: resolveTestDatabaseUrl() }),
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "OrderItem", "Order", "Product" RESTART IDENTITY CASCADE',
  );
});

async function seedProducts() {
  await prisma.product.createMany({
    data: [
      { name: "Rama Dębowa 30×40", price: 149.99, stock: 5 },
      { name: "Rama Jesionowa 21×30", price: 89, stock: 2 },
    ],
  });
}

function facts(overrides: Partial<PaidOrderFacts> = {}): PaidOrderFacts {
  return {
    stripeSessionId: "cs_test_abc",
    total: 408.98,
    customerEmail: "klient@example.com",
    userId: "user_abc",
    shippingMethod: "paczkomat",
    shippingAddress: { firstName: "Jan", city: "Kraków" },
    paymentMethod: "blik",
    lineItems: [
      { productId: 1, name: "Rama Dębowa 30×40", quantity: 2, unitPrice: 149.99 },
      { productId: 2, name: "Rama Jesionowa 21×30", quantity: 1, unitPrice: 89 },
      { productId: null, name: "Dostawa — InPost Paczkomat", quantity: 1, unitPrice: 20 },
    ],
    ...overrides,
  };
}

describe("recordPaidOrder", () => {
  it("creates the order with items and decrements stock, skipping the shipping line", async () => {
    await seedProducts();

    const result = await recordPaidOrder(prisma, facts());
    expect(result.created).toBe(true);
    if (!result.created) return;

    expect(result.order.status).toBe("paid");
    expect(result.order.total).toBe(408.98);
    expect(result.order.stripeSessionId).toBe("cs_test_abc");

    const items = await prisma.orderItem.findMany({ orderBy: { productId: "asc" } });
    expect(items).toHaveLength(2); // shipping line produced no OrderItem
    expect(items[0]).toMatchObject({ productId: 1, quantity: 2, price: 149.99 });
    expect(items[1]).toMatchObject({ productId: 2, quantity: 1, price: 89 });

    const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
    expect(products[0].stock).toBe(3); // 5 - 2
    expect(products[1].stock).toBe(1); // 2 - 1
  });

  it("treats a duplicate stripeSessionId as a no-op: no second order, no double decrement", async () => {
    await seedProducts();

    const first = await recordPaidOrder(prisma, facts());
    expect(first.created).toBe(true);

    const retry = await recordPaidOrder(prisma, facts());
    expect(retry).toEqual({ created: false, reason: "duplicate" });

    expect(await prisma.order.count()).toBe(1);
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
    expect(products[0].stock).toBe(3);
    expect(products[1].stock).toBe(1);
  });

  it("rolls back the whole order when any line fails — no partial stock decrement", async () => {
    await seedProducts();

    const badFacts = facts({
      lineItems: [
        { productId: 1, name: "Rama Dębowa 30×40", quantity: 2, unitPrice: 149.99 },
        { productId: 999, name: "Widmo", quantity: 1, unitPrice: 10 }, // no such product
      ],
    });

    await expect(recordPaidOrder(prisma, badFacts)).rejects.toThrow();

    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.orderItem.count()).toBe(0);
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
    expect(products[0].stock).toBe(5); // untouched — transaction rolled back
  });
});
