import { describe, it, expect } from "vitest";
import { SHIPPING_COSTS, FREE_SHIPPING_THRESHOLD } from "@sznyt/shared";
import { checkoutTotals } from "./checkoutTotals";

const item = (price: number, quantity: number) => ({ price, quantity });

describe("checkoutTotals", () => {
  it("sums line totals into the subtotal", () => {
    const totals = checkoutTotals([item(100, 2), item(50, 1)], null);
    expect(totals.subtotal).toBe(250);
  });

  it("charges no shipping before a method is chosen", () => {
    const totals = checkoutTotals([item(100, 1)], null);
    expect(totals.shippingCost).toBe(0);
    expect(totals.total).toBe(100);
  });

  it("adds the method's rate below the free-shipping threshold", () => {
    const totals = checkoutTotals([item(100, 1)], "paczkomat");
    expect(totals.shippingCost).toBe(SHIPPING_COSTS.paczkomat);
    expect(totals.total).toBe(100 + SHIPPING_COSTS.paczkomat);
    expect(totals.isFreeShipping).toBe(false);
  });

  it("ships free exactly at the threshold", () => {
    const totals = checkoutTotals([item(FREE_SHIPPING_THRESHOLD, 1)], "dpd");
    expect(totals.shippingCost).toBe(0);
    expect(totals.isFreeShipping).toBe(true);
    expect(totals.total).toBe(FREE_SHIPPING_THRESHOLD);
  });

  it("reports the remaining amount to free shipping, clamped at 0", () => {
    expect(checkoutTotals([item(299, 1)], null).remainingToFreeShipping).toBe(
      FREE_SHIPPING_THRESHOLD - 299,
    );
    expect(checkoutTotals([item(FREE_SHIPPING_THRESHOLD + 50, 1)], null).remainingToFreeShipping).toBe(0);
  });
});
