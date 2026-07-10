import { describe, it, expect } from "vitest";
import {
  computeQuarterRevenue,
  QUARTERLY_REVENUE_CAP_PLN,
} from "./computeQuarterRevenue.ts";

// 2026-07-10 12:00 Warsaw (CEST, UTC+2) — mid Q3.
const NOW = new Date("2026-07-10T10:00:00Z");

function paidOrder(total: number, createdAt: string) {
  return { status: "paid", total, createdAt: new Date(createdAt) };
}

describe("computeQuarterRevenue", () => {
  it("returns zero total and safe threshold for no orders", () => {
    const result = computeQuarterRevenue([], NOW);

    expect(result).toEqual({
      quarter: 3,
      year: 2026,
      totalPln: 0,
      capPln: QUARTERLY_REVENUE_CAP_PLN,
      threshold: "safe",
    });
  });

  it("sums a single paid order in the current quarter", () => {
    const result = computeQuarterRevenue([paidOrder(249.99, "2026-07-05T08:00:00Z")], NOW);

    expect(result.totalPln).toBe(249.99);
    expect(result.threshold).toBe("safe");
  });

  it("excludes orders whose status is not paid", () => {
    const orders = [
      paidOrder(100, "2026-07-05T08:00:00Z"),
      { status: "pending", total: 500, createdAt: new Date("2026-07-05T09:00:00Z") },
    ];

    expect(computeQuarterRevenue(orders, NOW).totalPln).toBe(100);
  });

  it("assigns quarter-boundary orders by Warsaw local time, not UTC", () => {
    const orders = [
      // 21:30Z = 23:30 CEST on Jun 30 → Q2, excluded from Q3.
      paidOrder(1000, "2026-06-30T21:30:00Z"),
      // 22:30Z = 00:30 CEST on Jul 1 → Q3, included despite June UTC date.
      paidOrder(200, "2026-06-30T22:30:00Z"),
    ];

    expect(computeQuarterRevenue(orders, NOW).totalPln).toBe(200);
  });

  it("keeps a late New Year's Eve order in Q4 of the old year", () => {
    // 2026-12-31 23:59 Warsaw (CET, UTC+1) — Q4 2026.
    const q4Now = new Date("2026-12-31T22:59:00Z");
    const orders = [
      paidOrder(300, "2026-12-31T22:30:00Z"), // 23:30 Warsaw → Q4 2026
      paidOrder(400, "2026-12-31T23:30:00Z"), // 00:30 Warsaw Jan 1 → Q1 2027
    ];

    const result = computeQuarterRevenue(orders, q4Now);

    expect(result.quarter).toBe(4);
    expect(result.year).toBe(2026);
    expect(result.totalPln).toBe(300);
  });

  it("sums grosz amounts without float drift", () => {
    const orders = [
      paidOrder(0.1, "2026-07-01T08:00:00Z"),
      paidOrder(0.2, "2026-07-02T08:00:00Z"),
    ];

    expect(computeQuarterRevenue(orders, NOW).totalPln).toBe(0.3);
  });

  it("stays safe just under 70% of the cap", () => {
    const justUnder70 = QUARTERLY_REVENUE_CAP_PLN * 0.7 - 0.01;

    expect(computeQuarterRevenue([paidOrder(justUnder70, "2026-07-05T08:00:00Z")], NOW).threshold).toBe("safe");
  });

  it("transitions to warn70 at exactly 70% of the cap", () => {
    const exactly70 = 7569.45; // 10813.50 * 0.7

    expect(computeQuarterRevenue([paidOrder(exactly70, "2026-07-05T08:00:00Z")], NOW).threshold).toBe("warn70");
  });

  it("transitions to warn90 at exactly 90% of the cap", () => {
    const exactly90 = 9732.15; // 10813.50 * 0.9

    expect(computeQuarterRevenue([paidOrder(exactly90, "2026-07-05T08:00:00Z")], NOW).threshold).toBe("warn90");
  });

  it("stays warn90 at exactly the cap — over means exceeded, not reached", () => {
    expect(
      computeQuarterRevenue([paidOrder(QUARTERLY_REVENUE_CAP_PLN, "2026-07-05T08:00:00Z")], NOW).threshold,
    ).toBe("warn90");
  });

  it("transitions to over once the cap is exceeded", () => {
    const orders = [
      paidOrder(QUARTERLY_REVENUE_CAP_PLN, "2026-07-05T08:00:00Z"),
      paidOrder(0.01, "2026-07-06T08:00:00Z"),
    ];

    expect(computeQuarterRevenue(orders, NOW).threshold).toBe("over");
  });
});
