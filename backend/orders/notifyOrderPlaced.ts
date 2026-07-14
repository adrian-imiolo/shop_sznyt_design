import { renderOrderConfirmation, renderAdminNewOrder } from "../emails/index.ts";
import type { Mailer } from "../emails/index.ts";
import type { OrderEmailData } from "../emails/types.ts";
import type { PaidOrderFacts } from "./types.ts";

/**
 * Best-effort order notifications: customer confirmation + admin new-order
 * alert. Each email fails independently — a rejected SMTP send must never
 * propagate for an order that's already recorded, so this function never
 * throws.
 */
export async function notifyOrderPlaced(
  mailer: Mailer,
  facts: PaidOrderFacts,
  orderId: number,
): Promise<void> {
  // Only product lines become email items (the line-item contract:
  // productId null marks the shipping line). The renderer derives the
  // delivery cost from the total and shows it as its own Dostawa row.
  const emailData: OrderEmailData = {
    orderId,
    items: facts.lineItems
      .filter((item) => item.productId !== null)
      .map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    total: facts.total,
    shippingMethod: facts.shippingMethod,
    shippingAddress: facts.shippingAddress,
    paymentMethod: facts.paymentMethod,
    customerEmail: facts.customerEmail,
    note: facts.note,
  };

  if (emailData.customerEmail) {
    try {
      await mailer.send({
        to: emailData.customerEmail,
        ...renderOrderConfirmation(emailData),
      });
    } catch (emailErr) {
      console.error("Błąd wysyłania emaila:", (emailErr as Error).message);
    }
  }

  if (process.env.CONTACT_RECIPIENT) {
    try {
      await mailer.send({
        to: process.env.CONTACT_RECIPIENT,
        ...renderAdminNewOrder(emailData),
      });
    } catch (emailErr) {
      console.error("Błąd wysyłania emaila do admina:", (emailErr as Error).message);
    }
  }
}
