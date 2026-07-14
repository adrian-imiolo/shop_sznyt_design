import express from "express";
import { renderOrderShipped } from "../emails/index.ts";
import { FULFILLMENT_STATUSES } from "@sznyt/shared";

/**
 * Orders routes (issue #108): admin list + fulfillment, per-user orders,
 * order detail with ownership check, and the public by-session lookup the
 * success page uses. Handler bodies moved verbatim from app.js; by-session
 * now registers before /:id (matching is unaffected — /orders/:id can't
 * match the two-segment by-session path; it just groups the multi-segment
 * routes ahead of the catch-all-ish /:id).
 *
 * @param {object} deps
 * @param {object} deps.prisma
 * @param {{ requireAuth: Function, getAuth: Function }} deps.auth
 * @param {{ send: Function }} deps.mailer
 * @param {Function} deps.requireAdmin
 * @param {Function} deps.getRole
 */
export function createOrdersRouter({ prisma, auth, mailer, requireAdmin, getRole }) {
  const router = express.Router();

  router.get("/orders", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // update fulfillment status + tracking number
  router.patch("/orders/:id/fulfillment", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { fulfillmentStatus, trackingNumber } = req.body;

      if (!FULFILLMENT_STATUSES.includes(fulfillmentStatus)) {
        return res.status(400).json({ error: "Nieprawidłowy status" });
      }

      const order = await prisma.order.update({
        where: { id },
        data: { fulfillmentStatus, trackingNumber: trackingNumber || null },
      });

      // send shipping email when status set to shipped and we have customer email + tracking number
      if (fulfillmentStatus === "shipped" && order.customerEmail && trackingNumber) {
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
          console.error("Błąd wysyłania emaila o wysyłce:", emailErr.message);
        }
      }

      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.get("/orders/user/:userId", auth.requireAuth(), async (req, res) => {
    try {
      const { userId } = req.params;
      if (auth.getAuth(req).userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.get("/orders/by-session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const order = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: { items: { include: { product: true } } },
      });
      if (!order) return res.status(404).json({ error: "Nie znaleziono zamówienia" });
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.get("/orders/:id", auth.requireAuth(), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
      if (!order) return res.status(404).json({ error: "Nie znaleziono zamówienia" });
      // Guest orders (userId=null) are only reachable via /orders/by-session/:sessionId —
      // sequential ids must not expose their shipping data to other signed-in users.
      // Admins bypass the ownership check: the admin order-detail page reads any
      // order (guest ones included) through this endpoint.
      if (order.userId !== auth.getAuth(req).userId && getRole(req) !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  return router;
}
