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

/**
 * Free-form address captured at checkout. Courier orders carry
 * firstName/lastName/street/postalCode/city/phone/email; paczkomat orders
 * additionally carry the point's code and name.
 */
export type ShippingAddress = Record<string, string | undefined> | null;

export interface OrderEmailData {
  orderId: number;
  items: OrderLineItem[];
  /** Grand total in PLN, including shipping. */
  total: number;
  shippingMethod: string | null;
  shippingAddress: ShippingAddress;
  paymentMethod: string | null;
  customerEmail: string | null;
}
