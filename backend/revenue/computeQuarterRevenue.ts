import type { QuarterRevenue, QuarterRevenueThreshold } from "@sznyt/shared";

// 2026 działalność-nierejestrowana cap. Set by law, changes year over year —
// bump manually each tax year.
export const QUARTERLY_REVENUE_CAP_PLN = 10813.5;

export type RevenueOrder = {
  status: string;
  total: number;
  createdAt: Date;
};

/**
 * Sum paid-order revenue for the calendar quarter containing `now`.
 * Quarter boundaries follow Europe/Warsaw local time — `createdAt` is stored
 * UTC, and a late-evening order near a boundary belongs to the Polish-time
 * quarter, which is what the DN cap is assessed against.
 */
export function computeQuarterRevenue(orders: RevenueOrder[], now: Date): QuarterRevenue {
  const { year, quarter } = warsawYearQuarter(now);

  // Sum in grosze — Float totals accumulate drift at PLN scale.
  const totalGr = orders
    .filter((order) => order.status === "paid")
    .filter((order) => {
      const created = warsawYearQuarter(order.createdAt);
      return created.year === year && created.quarter === quarter;
    })
    .reduce((sum, order) => sum + Math.round(order.total * 100), 0);

  const capGr = Math.round(QUARTERLY_REVENUE_CAP_PLN * 100);

  return {
    quarter,
    year,
    totalPln: totalGr / 100,
    capPln: QUARTERLY_REVENUE_CAP_PLN,
    threshold: thresholdFor(totalGr, capGr),
  };
}

function thresholdFor(totalGr: number, capGr: number): QuarterRevenueThreshold {
  if (totalGr > capGr) return "over";
  if (totalGr >= Math.round(capGr * 0.9)) return "warn90";
  if (totalGr >= Math.round(capGr * 0.7)) return "warn70";
  return "safe";
}

const warsawParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "numeric",
});

function warsawYearQuarter(date: Date): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const parts = warsawParts.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  return { year, quarter: Math.ceil(month / 3) as 1 | 2 | 3 | 4 };
}
