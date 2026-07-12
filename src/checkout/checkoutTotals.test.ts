import { describe, it, expect } from "vitest";
import { checkoutTotals } from "./checkoutTotals";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COSTS } from "@sznyt/shared";
import type { CartItem } from "../types";

function item(price: number, quantity: number): CartItem {
  return { id: 1, name: "Rama", price, imageUrl: "/r.jpg", quantity, stock: 10 };
}

describe("checkoutTotals", () => {
  it("sums line items into the subtotal", () => {
    const totals = checkoutTotals([item(100, 2), item(50, 1)], null);
    expect(totals.subtotal).toBe(250);
  });

  it("no method chosen: shipping is 0, total equals subtotal", () => {
    const totals = checkoutTotals([item(100, 1)], null);
    expect(totals.shippingCost).toBe(0);
    expect(totals.total).toBe(100);
  });

  it("below the threshold: charges the method's cost", () => {
    const totals = checkoutTotals([item(FREE_SHIPPING_THRESHOLD - 1, 1)], "paczkomat");
    expect(totals.isFreeShipping).toBe(false);
    expect(totals.shippingCost).toBe(SHIPPING_COSTS.paczkomat);
    expect(totals.total).toBe(FREE_SHIPPING_THRESHOLD - 1 + SHIPPING_COSTS.paczkomat);
  });

  it("at the threshold exactly: shipping is free", () => {
    const totals = checkoutTotals([item(FREE_SHIPPING_THRESHOLD, 1)], "dpd");
    expect(totals.isFreeShipping).toBe(true);
    expect(totals.shippingCost).toBe(0);
    expect(totals.total).toBe(FREE_SHIPPING_THRESHOLD);
  });
});
