import express from "express";
import { rateLimit } from "express-rate-limit";
import { buildCheckoutLineItems, normalizeOrderNote } from "../orders/index.ts";

/**
 * Checkout-session route (issue #107) — the outbound half of the Stripe
 * adapter (ADR-0001). Validation and pricing live in the order-intake
 * module; this route only fetches products and talks to Stripe.
 *
 * @param {object} deps
 * @param {object|null} deps.stripe  Stripe client, or null in demo mode.
 * @param {object} deps.prisma
 */
export function createCheckoutRouter({ stripe, prisma }) {
  const router = express.Router();

  // Checkout calls Stripe — stop dumb loops before they become API spam.
  const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
  });

  router.post("/create-checkout-session", checkoutLimiter, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Checkout disabled in demo mode" });
      }
      const { items, userId, shippingMethod, shippingAddress, note } = req.body;

      const noteResult = normalizeOrderNote(note);
      if (!noteResult.ok) {
        return res.status(noteResult.status).json({ error: noteResult.error });
      }

      // Fetch the referenced products; all validation and pricing lives in the
      // order-intake module (server-authoritative — the client only chooses
      // ids and quantities).
      const ids = Array.isArray(items)
        ? items.map((item) => Number(item.id)).filter(Number.isInteger)
        : [];
      const products = ids.length
        ? await prisma.product.findMany({ where: { id: { in: ids } } })
        : [];

      const result = buildCheckoutLineItems(
        items,
        products,
        shippingMethod,
        process.env.FRONTEND_URL,
      );
      if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
      }

      const customerEmail = shippingAddress?.email || undefined;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "p24", "blik"],
        line_items: result.lineItems,
        mode: "payment",
        customer_email: customerEmail,
        success_url: `${process.env.FRONTEND_URL}/sukces?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/koszyk`,
        metadata: {
          ...(userId ? { userId } : {}),
          ...(noteResult.note ? { note: noteResult.note } : {}),
          shippingMethod,
          shippingAddress: JSON.stringify(shippingAddress),
        },
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error(err);
      if (err.code === "email_invalid") {
        return res.status(400).json({ error: "Podaj poprawny adres e-mail." });
      }
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  return router;
}
