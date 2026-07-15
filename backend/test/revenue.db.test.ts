/**
 * Integration tests for GET /revenue/quarter (issue #108): the DN-cap
 * dashboard endpoint. Quarter math lives in the pure, unit-tested
 * computeQuarterRevenue — here we cover the admin boundary and that only
 * paid orders reach the sum.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { useAppHarness } from "./harness.ts";
import { QUARTERLY_REVENUE_CAP_PLN } from "../revenue/index.ts";

const harness = useAppHarness();

describe("GET /revenue/quarter", () => {
  it("rejects anonymous callers with 401", async () => {
    const res = await request(harness.appAs().app).get("/revenue/quarter");

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(harness.appAs({ userId: "user_regular" }).app).get(
      "/revenue/quarter",
    );

    expect(res.status).toBe(403);
  });

  it("sums paid orders for the current quarter, excluding pending ones", async () => {
    await harness.prisma.order.createMany({
      data: [
        { stripeSessionId: "cs_paid_1", status: "paid", total: 149.99 },
        { stripeSessionId: "cs_paid_2", status: "paid", total: 89.0 },
        { stripeSessionId: "cs_pending", status: "pending", total: 500 },
      ],
    });

    const res = await request(harness.appAs({ userId: "user_admin", role: "admin" }).app).get(
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
