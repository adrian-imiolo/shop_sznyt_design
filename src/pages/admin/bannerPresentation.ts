import type { QuarterRevenue, QuarterRevenueThreshold } from "@sznyt/shared";

export type BannerTone = "safe" | "warn" | "danger";

export type BannerPresentation = {
  tone: BannerTone;
  message: string | null;
  percent: number;
};

const THRESHOLD_PRESENTATION: Record<
  QuarterRevenueThreshold,
  { tone: BannerTone; message: string | null }
> = {
  safe: { tone: "safe", message: null },
  warn70: {
    tone: "warn",
    message: "Ponad 70% limitu — czas zaplanować rejestrację działalności.",
  },
  warn90: {
    tone: "danger",
    message: "Ponad 90% limitu — rozpocznij rejestrację działalności.",
  },
  over: {
    tone: "danger",
    message: "Limit przekroczony — obowiązek rejestracji działalności w ciągu 7 dni!",
  },
};

/**
 * Pure presentation core for the DN revenue-cap banner: maps the backend's
 * quarter summary to a tone, the Polish warning copy, and a clamped percent.
 * The component renders this result — no logic in JSX (same pattern as
 * ADR-0003's checkout assembly).
 */
export function bannerPresentation(quarterRevenue: QuarterRevenue): BannerPresentation {
  const { tone, message } = THRESHOLD_PRESENTATION[quarterRevenue.threshold];
  // integer grosze keep boundary percentages exact (mirrors computeQuarterRevenue)
  const totalGr = Math.round(quarterRevenue.totalPln * 100);
  const capGr = Math.round(quarterRevenue.capPln * 100);
  const percent = Math.min((totalGr * 100) / capGr, 100);
  return { tone, message, percent };
}
