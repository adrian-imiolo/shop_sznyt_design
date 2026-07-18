import { describe, it, expect } from "vitest";
import { bannerPresentation } from "./bannerPresentation";
import type { QuarterRevenue, QuarterRevenueThreshold } from "@sznyt/shared";

const CAP_PLN = 10813.5;

function quarterRevenue(totalPln: number, threshold: QuarterRevenueThreshold): QuarterRevenue {
  return { quarter: 3, year: 2026, totalPln, capPln: CAP_PLN, threshold };
}

describe("bannerPresentation", () => {
  it("safe: green tone, no message", () => {
    const result = bannerPresentation(quarterRevenue(238.99, "safe"));
    expect(result.tone).toBe("safe");
    expect(result.message).toBeNull();
  });

  it("warn70: warn tone, plan-registration copy", () => {
    const result = bannerPresentation(quarterRevenue(7569.45, "warn70"));
    expect(result.tone).toBe("warn");
    expect(result.message).toBe(
      "Ponad 70% limitu — czas zaplanować rejestrację działalności.",
    );
  });

  it("warn90: danger tone, start-registration copy, exactly 90 at the boundary", () => {
    // 9732.15 = 10813.50 * 0.9 to the grosz
    const result = bannerPresentation(quarterRevenue(9732.15, "warn90"));
    expect(result.tone).toBe("danger");
    expect(result.message).toBe("Ponad 90% limitu — rozpocznij rejestrację działalności.");
    expect(result.percent).toBe(90);
  });

  it("over: danger tone, statutory 7-day registration-obligation copy", () => {
    const result = bannerPresentation(quarterRevenue(10900, "over"));
    expect(result.tone).toBe("danger");
    expect(result.message).toBe(
      "Limit przekroczony — obowiązek rejestracji działalności w ciągu 7 dni!",
    );
  });

  it("computes percent of the cap", () => {
    const result = bannerPresentation(quarterRevenue(238.99, "safe"));
    expect(result.percent).toBeCloseTo(2.21, 2);
  });

  it("lands exactly on 70 at the warn70 boundary — no float drift", () => {
    // 7569.45 = 10813.50 * 0.7 to the grosz
    expect(bannerPresentation(quarterRevenue(7569.45, "warn70")).percent).toBe(70);
  });

  it("reaches exactly 100 at the cap", () => {
    expect(bannerPresentation(quarterRevenue(CAP_PLN, "warn90")).percent).toBe(100);
  });

  it("clamps percent to 100 when revenue exceeds the cap", () => {
    expect(bannerPresentation(quarterRevenue(12000, "over")).percent).toBe(100);
  });
});
