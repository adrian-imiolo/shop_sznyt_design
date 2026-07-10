/**
 * Threshold states for the działalność-nierejestrowana quarterly revenue cap:
 * warn70 = lead time to begin registration, warn90 = hard-stop signal,
 * over = cap exceeded (mandatory registration within 7 days).
 */
export const REVENUE_THRESHOLDS = ["safe", "warn70", "warn90", "over"] as const;

export type QuarterRevenueThreshold = (typeof REVENUE_THRESHOLDS)[number];

/** Response shape of GET /revenue/quarter. */
export type QuarterRevenue = {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  totalPln: number;
  capPln: number;
  threshold: QuarterRevenueThreshold;
};
