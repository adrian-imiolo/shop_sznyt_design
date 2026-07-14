import express from "express";
import {
  paidOrderFactsFromSession,
  recordPaidOrder,
  notifyOrderPlaced,
} from "../orders/index.ts";

/**
 * Stripe webhook route (issue #107). This is the Stripe adapter for order
 * intake (ADR-0001): signature verification and all Stripe I/O happen here,
 * then plain facts go into the order-intake module.
 *
 * Must be mounted BEFORE express.json() — signature verification needs the
 * raw request body, byte for byte.
 *
 * @param {object} deps
 * @param {object|null} deps.stripe  Stripe client, or null in demo mode.
 * @param {object} deps.prisma
 * @param {{ send: Function }} deps.mailer
 */
export function createWebhookRouter({ stripe, prisma, mailer }) {
  const router = express.Router();

  router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured (demo mode)" });
      }
      const sig = req.headers["stripe-signature"];
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
      }
      if (event.type === "checkout.session.completed") {
        try {
          const session = event.data.object;

          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { expand: ["data.price.product"], limit: 100 },
          );

          let paymentMethod = null;
          if (session.payment_intent) {
            try {
              const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
                expand: ["latest_charge"],
              });
              paymentMethod = pi.latest_charge?.payment_method_details?.type ?? null;
            } catch {
              // non-blocking — order still saves without it
            }
          }

          const facts = paidOrderFactsFromSession(session, lineItems.data, paymentMethod);
          const result = await recordPaidOrder(prisma, facts);

          // Webhook retry for an already-recorded order — 200 no-op, and
          // crucially no duplicate emails.
          if (result.created) {
            await notifyOrderPlaced(mailer, facts, result.order.id);
          }
        } catch (err) {
          // Must return 500 so Stripe retries; a swallowed error here
          // permanently loses a paid order.
          console.error("Błąd przetwarzania zamówienia:", err.message);
          return res.status(500).json({ error: "Order processing failed" });
        }
      }

      res.json({ received: true });
    },
  );

  return router;
}
