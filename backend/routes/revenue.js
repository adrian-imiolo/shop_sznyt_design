import express from "express";
import { computeQuarterRevenue } from "../revenue/index.ts";

/**
 * Quarterly DN-revenue route (issue #108): admin dashboard's view of paid
 * revenue vs the registration cap. Failures propagate to the shared
 * serverError middleware (issue #115).
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
  router.get(
    "/revenue/quarter",
    auth.requireAuth(),
    requireAdmin,
    async function getQuarterRevenue(req, res) {
      const paidOrders = await prisma.order.findMany({
        where: { status: "paid" },
        select: { status: true, total: true, createdAt: true },
      });
      res.json(computeQuarterRevenue(paidOrders, new Date()));
    },
  );

  return router;
}
