import { FREE_SHIPPING_THRESHOLD, calcShippingCost, type ShippingMethod } from "@sznyt/shared";

export type CheckoutTotals = {
  subtotal: number;
  shippingCost: number;
  total: number;
  isFreeShipping: boolean;
  /** How much more to spend for free shipping; 0 once the threshold is reached. */
  remainingToFreeShipping: number;
};

export function checkoutTotals(
  items: { price: number; quantity: number }[],
  method: ShippingMethod | null,
): CheckoutTotals {
  const subtotal = items.reduce(
    function lineTotal(sum, item) {
      return sum + item.price * item.quantity;
    },
    0,
  );
  const shippingCost = calcShippingCost(subtotal, method);
  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    isFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
    remainingToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
