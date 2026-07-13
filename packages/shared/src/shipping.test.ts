import { describe, it, expect } from "vitest";
import { calcShippingCost, deriveShippingCost, isShippingMethod, SHIPPING_COSTS, SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from "./shipping.ts";
import { FULFILLMENT_LABELS, FULFILLMENT_LABELS_SHORT, SHIPPING_METHOD_LABELS } from "./labels.ts";
import { FULFILLMENT_STATUSES } from "./statuses.ts";

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

describe("deriveShippingCost", () => {
  it("is the gap between the order total and the items subtotal", () => {
    expect(deriveShippingCost(319, 299)).toBe(20);
  });

  it("is 0 for free-shipping orders (total equals items subtotal)", () => {
    expect(deriveShippingCost(400, 400)).toBe(0);
  });

  it("never goes negative on inconsistent data", () => {
    expect(deriveShippingCost(290, 299)).toBe(0);
  });
});

describe("vocabulary completeness", () => {
  it("every shipping method has a cost and a label", () => {
    for (const method of SHIPPING_METHODS) {
      expect(SHIPPING_COSTS[method]).toBeGreaterThan(0);
      expect(SHIPPING_METHOD_LABELS[method]).toBeTruthy();
      expect(isShippingMethod(method)).toBe(true);
    }
  });

  it("rejects unknown shipping methods", () => {
    expect(isShippingMethod("pigeon")).toBe(false);
  });

  it("every fulfillment status has both label forms", () => {
    for (const status of FULFILLMENT_STATUSES) {
      expect(FULFILLMENT_LABELS[status]).toBeTruthy();
      expect(FULFILLMENT_LABELS_SHORT[status]).toBeTruthy();
    }
  });
});
