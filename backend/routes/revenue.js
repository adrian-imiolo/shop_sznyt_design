import express from "express";
import { computeQuarterRevenue } from "../revenue/index.ts";

/**
 * Quarterly DN-revenue route (issue #108): admin dashboard's view of paid
 * revenue vs the registration cap. Handler moved verbatim from app.js.
 *
 * @param {object} deps
 * @param {object} deps.prisma
 * @param {{ requireAuth: Function }} deps.auth
 * @param {Function} deps.requireAdmin
 */
export function createRevenueRouter({ prisma, auth, requireAdmin }) {
  const router = express.Router();

  // quarterly DN revenue vs the registration cap — order volume is tiny at DN
  // scale, so fetching all paid orders and filtering in the pure function is fine
  router.get("/revenue/quarter", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const paidOrders = await prisma.order.findMany({
        where: { status: "paid" },
        select: { status: true, total: true, createdAt: true },
      });
      res.json(computeQuarterRevenue(paidOrders, new Date()));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  return router;
}
