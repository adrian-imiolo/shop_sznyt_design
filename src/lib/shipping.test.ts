import { describe, it, expect } from "vitest";
import { calcShippingCost, SHIPPING_COSTS, FREE_SHIPPING_THRESHOLD } from "./shipping";

describe("calcShippingCost", () => {
  it("returns 0 when no shipping method is chosen yet", () => {
    expect(calcShippingCost(100, null)).toBe(0);
  });

  it("charges the method's rate below the free-shipping threshold", () => {
    expect(calcShippingCost(349, "paczkomat")).toBe(SHIPPING_COSTS.paczkomat);
    expect(calcShippingCost(100, "inpost_kurier")).toBe(SHIPPING_COSTS.inpost_kurier);
    expect(calcShippingCost(100, "dpd")).toBe(SHIPPING_COSTS.dpd);
  });

  it("is free exactly at the threshold", () => {
    expect(calcShippingCost(FREE_SHIPPING_THRESHOLD, "paczkomat")).toBe(0);
  });

  it("is free above the threshold", () => {
    expect(calcShippingCost(FREE_SHIPPING_THRESHOLD + 1, "dpd")).toBe(0);
  });
});
