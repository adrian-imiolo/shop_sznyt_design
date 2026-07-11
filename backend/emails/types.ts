export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface OrderLineItem {
  name: string;
  quantity: number;
  /** Unit price in PLN (not grosze). */
  unitPrice: number;
}

import type { ShippingAddress as ShippingAddressContract } from "@sznyt/shared";

/**
 * The shipping address contract (@sznyt/shared), consumed defensively:
 * Partial because historical Order rows may predate the full field set —
 * renderers filter out whatever is absent.
 */
export type ShippingAddress = Partial<ShippingAddressContract> | null;

export interface OrderEmailData {
  orderId: number;
  items: OrderLineItem[];
  /** Grand total in PLN, including shipping. */
  total: number;
  shippingMethod: string | null;
  shippingAddress: ShippingAddress;
  paymentMethod: string | null;
  customerEmail: string | null;
  /** Customer delivery instructions from checkout. */
  note: string | null;
}
