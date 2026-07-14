import express from "express";
import cors from "cors";
import { createWebhookRouter } from "./routes/webhook.js";
import { createCheckoutRouter } from "./routes/checkout.js";
import { createProductsRouter } from "./routes/products.js";
import { createOrdersRouter } from "./routes/orders.js";
import { createRevenueRouter } from "./routes/revenue.js";
import { createFormsRouter } from "./routes/forms.js";
import { createAdminAuth } from "./middleware/adminAuth.js";

/**
 * App factory (issue #106). All external services come in through the
 * seams; the entrypoint (index.js) wires the real ones, tests inject fakes.
 * Routes live in routes/ (issues #107, #108) — this file is wiring only.
 *
 * @param {object} deps
 * @param {{ middleware: Function, requireAuth: Function, getAuth: Function }} deps.auth
 *   Clerk in production; swapped as a unit because Clerk's getAuth only
 *   reads state its own middleware sets.
 * @param {object|null} deps.stripe  Stripe client, or null in demo mode.
 * @param {{ send: Function }} deps.mailer
 * @param {object} deps.prisma
 */
export function createApp({ auth, stripe, mailer, prisma }) {
  const app = express();

  // Render/Railway sit behind exactly one proxy hop — required for
  // express-rate-limit to see real client IPs instead of the proxy's.
  app.set("trust proxy", 1);

  // FRONTEND_URL in prod, localhost in dev, *.vercel.app for preview deployments
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    /\.vercel\.app$/,
  ].filter(Boolean);

  app.use(cors({
    origin: allowedOrigins,
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  app.use(auth.middleware);

  const { getRole, requireAdmin } = createAdminAuth(auth);

  // The money path (issue #107): webhook + checkout live in routes/, each
  // the Stripe adapter for its direction (ADR-0001). The webhook router
  // mounts before express.json() — signature verification needs the raw body.
  app.use(createWebhookRouter({ stripe, prisma, mailer }));

  app.use(express.json());

  app.use(createCheckoutRouter({ stripe, prisma }));
  app.use(createProductsRouter({ prisma, auth, requireAdmin }));
  app.use(createOrdersRouter({ prisma, auth, mailer, requireAdmin, getRole }));
  app.use(createRevenueRouter({ prisma, auth, requireAdmin }));
  app.use(createFormsRouter({ prisma, mailer }));

  return app;
}
