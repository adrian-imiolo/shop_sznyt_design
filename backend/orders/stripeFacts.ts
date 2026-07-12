import type Stripe from "stripe";
import type { PaidOrderFacts, PaidLineItem } from "./types.ts";

/**
 * Normalize a completed Stripe checkout session into plain order facts.
 * This is the read side of the line-item contract: lines stamped with
 * metadata.productId at checkout become product lines; anything else
 * (shipping) gets productId null.
 */
export function paidOrderFactsFromSession(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
  paymentMethod: string | null,
): PaidOrderFacts {
  return {
    stripeSessionId: session.id,
    total: (session.amount_total ?? 0) / 100,
    customerEmail: session.customer_details?.email ?? null,
    userId: session.metadata?.userId ?? null,
    shippingMethod: session.metadata?.shippingMethod || null,
    shippingAddress: session.metadata?.shippingAddress
      ? JSON.parse(session.metadata.shippingAddress)
      : null,
    paymentMethod,
    note: session.metadata?.note || null,
    lineItems: lineItems.map(toPaidLineItem),
  };
}

function toPaidLineItem(item: Stripe.LineItem): PaidLineItem {
  // listLineItems is called with expand: ["data.price.product"], so product
  // is the full object, never a bare id string.
  const product = item.price?.product as Stripe.Product | undefined;
  const rawProductId = Number(product?.metadata?.productId);

  return {
    productId: Number.isInteger(rawProductId) && rawProductId > 0 ? rawProductId : null,
    name: item.description ?? product?.name ?? "",
    quantity: item.quantity ?? 1,
    unitPrice: (item.price?.unit_amount ?? 0) / 100,
  };
}
