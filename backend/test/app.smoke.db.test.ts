/**
 * Supertest smoke test for the createApp() seam (issue #106): the whole
 * Express app runs over HTTP against the real test database, with fakes
 * injected for auth, Stripe, and mail.
 */
import "dotenv/config"; // vitest doesn't load backend/.env into process.env
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveTestDatabaseUrl } from "../scripts/test-db-url.js";
import { createApp } from "../app.js";
import { fakeAuth, fakeStripe, captureMailer } from "./fakes.ts";

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

describe("createApp smoke test — GET /products", () => {
  it("serves seeded products over HTTP with all fakes injected", async () => {
    await prisma.product.createMany({
      data: [
        { name: "Rama Dębowa 30×40", price: 149.99, stock: 5 },
        { name: "Rama Jesionowa 21×30", price: 89, stock: 2 },
      ],
    });

    const app = createApp({
      auth: fakeAuth(),
      stripe: fakeStripe(),
      mailer: captureMailer(),
      prisma,
    });

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ name: "Rama Dębowa 30×40", price: 149.99 });
    expect(res.body[1]).toMatchObject({ name: "Rama Jesionowa 21×30", price: 89 });
  });
});
