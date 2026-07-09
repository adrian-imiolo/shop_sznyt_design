import type { PrismaClient, Order } from "../generated/prisma/client.js";
import type { PaidOrderFacts } from "./types.ts";

export type RecordPaidOrderResult =
  | { created: true; order: Order }
  | { created: false; reason: "duplicate" };

/**
 * Record a paid order: Order + OrderItems + atomic stock decrement, in one
 * transaction. Stock decrements happen here and only here — never on
 * cart-add or checkout-start.
 *
 * Idempotent on stripeSessionId: a webhook retry for an already-recorded
 * order returns { created: false } instead of throwing, so the caller can
 * skip emails without exception flow. Any other error propagates — the
 * webhook must 500 so Stripe retries, or a paid order is lost forever.
 */
export async function recordPaidOrder(
  prisma: PrismaClient,
  facts: PaidOrderFacts,
): Promise<RecordPaidOrderResult> {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          stripeSessionId: facts.stripeSessionId,
          status: "paid",
          total: facts.total,
          customerEmail: facts.customerEmail,
          userId: facts.userId,
          shippingMethod: facts.shippingMethod,
          shippingAddress: facts.shippingAddress ?? undefined,
          paymentMethod: facts.paymentMethod,
        },
      });

      for (const item of facts.lineItems) {
        if (item.productId === null) continue; // shipping line — see line-item contract

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return { created: true, order };
  } catch (err) {
    if (isDuplicateSessionError(err)) {
      return { created: false, reason: "duplicate" };
    }
    throw err;
  }
}

// P2002 = unique constraint violation; stripeSessionId is the only unique
// column an insert can collide on, so this is always a webhook retry.
function isDuplicateSessionError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2002"
  );
}
