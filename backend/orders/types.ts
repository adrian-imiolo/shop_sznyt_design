import type { ShippingAddress } from "../emails/types.ts";

/** Cart item as sent by the frontend — untrusted until validated. */
export interface CartItemInput {
  id: unknown;
  quantity: unknown;
}

/** The slice of Product the checkout builder needs. */
export interface CheckoutProduct {
  id: number;
  name: string;
  /** Unit price in PLN (not grosze). */
  price: number;
  stock: number;
  imageUrl: string | null;
}

/**
 * One line of a paid order, normalized from Stripe.
 * `productId: null` marks the shipping line item — see "Line-item contract"
 * in CONTEXT.md: only lines stamped with metadata.productId at checkout
 * become OrderItems and decrement stock.
 */
export interface PaidLineItem {
  productId: number | null;
  name: string;
  quantity: number;
  /** Unit price in PLN (not grosze). */
  unitPrice: number;
}

/** Everything order intake needs, already fetched from Stripe and normalized. */
export interface PaidOrderFacts {
  stripeSessionId: string;
  /** Grand total in PLN, including shipping. */
  total: number;
  customerEmail: string | null;
  userId: string | null;
  shippingMethod: string | null;
  shippingAddress: ShippingAddress;
  paymentMethod: string | null;
  /** Customer delivery instructions, already trimmed at checkout. */
  note: string | null;
  lineItems: PaidLineItem[];
}
