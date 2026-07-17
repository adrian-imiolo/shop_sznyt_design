import { renderOrderShipped } from "../emails/index.ts";
import type { Mailer } from "../emails/index.ts";

/** The slice of a persisted order the shipped notification needs. */
export interface ShippedOrderData {
  id: number;
  fulfillmentStatus: string;
  customerEmail: string | null;
  shippingMethod: string | null;
}

/**
 * Best-effort shipping notification (issue #130): emails the customer iff the
 * order is `shipped` AND has a customer email AND a tracking number. Send
 * failures are swallowed — a recorded fulfillment update must never fail
 * because of mail problems, so this function never throws.
 */
export async function notifyOrderShipped(
  mailer: Mailer,
  order: ShippedOrderData,
  trackingNumber: string | null | undefined,
): Promise<void> {
  if (order.fulfillmentStatus !== "shipped" || !order.customerEmail || !trackingNumber) return;

  try {
    await mailer.send({
      to: order.customerEmail,
      ...renderOrderShipped({
        orderId: order.id,
        trackingNumber,
        shippingMethod: order.shippingMethod,
      }),
    });
  } catch (emailErr) {
    console.error("Błąd wysyłania emaila o wysyłce:", (emailErr as Error).message);
  }
}
