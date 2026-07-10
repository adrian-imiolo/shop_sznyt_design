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
