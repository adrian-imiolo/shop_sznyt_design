import type { ShippingMethod } from "../types";

// Kept in sync with backend/index.js (SHIPPING_COSTS / FREE_SHIPPING_THRESHOLD) —
// the backend is authoritative; these values only drive what the cart displays.
export const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  paczkomat: 20,
  inpost_kurier: 25,
  dpd: 25,
};

export const FREE_SHIPPING_THRESHOLD = 350;

export function calcShippingCost(subtotal: number, method: ShippingMethod | null): number {
  if (!method) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COSTS[method];
}
