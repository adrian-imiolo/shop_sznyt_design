import { FREE_SHIPPING_THRESHOLD, calcShippingCost } from "@sznyt/shared";
import type { ShippingMethod } from "@sznyt/shared";
import type { CartItem } from "../types";

export type CheckoutTotals = {
  subtotal: number;
  shippingCost: number;
  total: number;
  isFreeShipping: boolean;
};

/** All the numbers Cart renders — it computes nothing itself (ADR-0003). */
export function checkoutTotals(items: CartItem[], method: ShippingMethod | null): CheckoutTotals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = calcShippingCost(subtotal, method);
  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    isFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}
