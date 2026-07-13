export const SHIPPING_METHODS = ["paczkomat", "inpost_kurier", "dpd"] as const;

export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export function isShippingMethod(value: string): value is ShippingMethod {
  return (SHIPPING_METHODS as readonly string[]).includes(value);
}

// The backend is authoritative for pricing; the frontend displays the same
// numbers it charges because both import these values (ADR-0002).
export const SHIPPING_COSTS: Record<string, number> = {
  paczkomat: 20,
  inpost_kurier: 25,
  dpd: 25,
};

export const FREE_SHIPPING_THRESHOLD = 350;

export function calcShippingCost(subtotal: number, method: string | null): number {
  if (!method) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (SHIPPING_COSTS[method] ?? 0);
}

// Recovers the shipping cost of a recorded order, whose total includes
// shipping but whose line items don't. Clamped at 0 so inconsistent
// historical data can never render a negative delivery line.
export function deriveShippingCost(total: number, itemsSubtotal: number): number {
  return Math.max(0, total - itemsSubtotal);
}
