import { sendEmail, renderOrderConfirmation, renderAdminNewOrder } from "../emails/index.ts";
import type { OrderEmailData } from "../emails/types.ts";
import type { PaidOrderFacts } from "./types.ts";

/**
 * Best-effort order notifications: customer confirmation + admin new-order
 * alert. Each email fails independently — a rejected SMTP send must never
 * propagate for an order that's already recorded, so this function never
 * throws.
 */
export async function notifyOrderPlaced(
  facts: PaidOrderFacts,
  orderId: number,
): Promise<void> {
  // Shipping appears as a regular line item, so the receipt shows
  // delivery cost without special-casing it.
  const emailData: OrderEmailData = {
    orderId,
    items: facts.lineItems.map((item) => ({
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
      await sendEmail({
        to: emailData.customerEmail,
        ...renderOrderConfirmation(emailData),
      });
    } catch (emailErr) {
      console.error("Błąd wysyłania emaila:", (emailErr as Error).message);
    }
  }

  if (process.env.CONTACT_RECIPIENT) {
    try {
      await sendEmail({
        to: process.env.CONTACT_RECIPIENT,
        ...renderAdminNewOrder(emailData),
      });
    } catch (emailErr) {
      console.error("Błąd wysyłania emaila do admina:", (emailErr as Error).message);
    }
  }
}
