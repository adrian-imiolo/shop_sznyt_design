import { FREE_SHIPPING_THRESHOLD, calcShippingCost, type ShippingMethod } from "@sznyt/shared";

export type CheckoutTotals = {
  subtotal: number;
  shippingCost: number;
  total: number;
  isFreeShipping: boolean;
};

export function checkoutTotals(
  items: { price: number; quantity: number }[],
  method: ShippingMethod | null,
): CheckoutTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = calcShippingCost(subtotal, method);
  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    isFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}
