/**
 * Integration tests for GET /revenue/quarter (issue #108): the DN-cap
 * dashboard endpoint. Quarter math lives in the pure, unit-tested
 * computeQuarterRevenue — here we cover the admin boundary and that only
 * paid orders reach the sum.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import type { PrismaClient } from "../generated/prisma/client.js";
import { createTestPrisma, truncateCommerceTables } from "./db.ts";
import { createApp } from "../app.js";
import { fakeAuth, fakeStripe, captureMailer, type FakeAuthOptions } from "./fakes.ts";
import { QUARTERLY_REVENUE_CAP_PLN } from "../revenue/index.ts";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createTestPrisma();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await truncateCommerceTables(prisma);
});

function buildApp(authOptions: FakeAuthOptions = {}) {
  return createApp({
    auth: fakeAuth(authOptions),
    stripe: fakeStripe(),
    mailer: captureMailer(),
    prisma,
  });
}

describe("GET /revenue/quarter", () => {
  it("rejects anonymous callers with 401", async () => {
    const res = await request(buildApp()).get("/revenue/quarter");

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(buildApp({ userId: "user_regular" })).get("/revenue/quarter");

    expect(res.status).toBe(403);
  });

  it("sums paid orders for the current quarter, excluding pending ones", async () => {
    await prisma.order.createMany({
      data: [
        { stripeSessionId: "cs_paid_1", status: "paid", total: 149.99 },
        { stripeSessionId: "cs_paid_2", status: "paid", total: 89.0 },
        { stripeSessionId: "cs_pending", status: "pending", total: 500 },
      ],
    });

    const res = await request(buildApp({ userId: "user_admin", role: "admin" })).get(
      "/revenue/quarter",
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalPln: 238.99,
      capPln: QUARTERLY_REVENUE_CAP_PLN,
      threshold: "safe",
    });
    expect([1, 2, 3, 4]).toContain(res.body.quarter);
  });
});
