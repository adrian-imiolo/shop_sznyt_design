import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import {
  renderOrderShipped,
  renderContactNotification,
  renderReturnRequest,
  renderComplaintRequest,
} from "./emails/index.ts";
import { computeQuarterRevenue } from "./revenue/index.ts";
import { createWebhookRouter } from "./routes/webhook.js";
import { createCheckoutRouter } from "./routes/checkout.js";
import { FULFILLMENT_STATUSES } from "@sznyt/shared";

/**
 * App factory (issue #106). All external services come in through the
 * seams; the entrypoint (index.js) wires the real ones, tests inject fakes.
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

  // Public forms trigger outbound SMTP + DB writes. The honeypot filters
  // dumb bots, this stops dumb loops. (Checkout has its own limiter in
  // routes/checkout.js.)
  const formLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
  });

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

  function getRole(req) {
    const { sessionClaims } = auth.getAuth(req);
    return sessionClaims?.metadata?.role ?? null;
  }

  function requireAdmin(req, res, next) {
    if (getRole(req) !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  }

  // The money path (issue #107): webhook + checkout live in routes/, each
  // the Stripe adapter for its direction (ADR-0001). The webhook router
  // mounts before express.json() — signature verification needs the raw body.
  app.use(createWebhookRouter({ stripe, prisma, mailer }));

  app.use(express.json());

  app.use(createCheckoutRouter({ stripe, prisma }));

  app.get("/products", async (req, res) => {
    try {
      const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // get single product
  app.get("/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const singleProduct = await prisma.product.findUnique({ where: { id } });
      if (!singleProduct) return res.status(404).json({ error: "Nie znaleziono produktu" });
      res.json(singleProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // delete product
  app.delete("/products/:id", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await prisma.product.delete({ where: { id } });
      res.json(deleted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // update product
  app.put("/products/:id", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock } = req.body;
      const id = Number(req.params.id);
      const updated = await prisma.product.update({
        where: { id },
        data: { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock },
      });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // reorder products — accepts [{id, sortOrder}, ...]
  app.patch("/products/reorder", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          prisma.product.update({ where: { id }, data: { sortOrder } })
        )
      );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  app.post("/products", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock } = req.body;
      const product = await prisma.product.create({
        data: { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock },
      });
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // submit contact form
  app.post("/contact", formLimiter, async (req, res) => {
    const { name, email, message, _hp } = req.body;
    if (_hp) return res.json({ ok: true });
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }
    try {
      const contactMessage = await prisma.contactMessage.create({
        data: { name, email, message },
      });
      try {
        await mailer.send({
          to: process.env.CONTACT_RECIPIENT,
          replyTo: email,
          ...renderContactNotification({ name, email, message }),
        });
      } catch (emailErr) {
        console.error("Błąd wysyłania emaila:", emailErr.message);
      }
      res.json(contactMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // quarterly DN revenue vs the registration cap — order volume is tiny at DN
  // scale, so fetching all paid orders and filtering in the pure function is fine
  app.get("/revenue/quarter", auth.requireAuth(), requireAdmin, async (req, res) => {
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

  // get orders
  app.get("/orders", auth.requireAuth(), requireAdmin, async (req, res) => {
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
  app.patch("/orders/:id/fulfillment", auth.requireAuth(), requireAdmin, async (req, res) => {
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

  app.get("/orders/user/:userId", auth.requireAuth(), async (req, res) => {
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

  app.get("/orders/:id", auth.requireAuth(), async (req, res) => {
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

  app.get("/orders/by-session/:sessionId", async (req, res) => {
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

  // submit return form
  app.post("/zwrot", formLimiter, async (req, res) => {
    const { orderNumber, name, email, reason, bankAccount, _hp } = req.body;
    if (_hp) return res.json({ ok: true });
    if (!orderNumber || !name || !email || !reason || !bankAccount) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }
    try {
      await mailer.send({
        to: process.env.CONTACT_RECIPIENT,
        replyTo: email,
        ...renderReturnRequest({ orderNumber, name, email, reason, bankAccount }),
      });
      res.json({ ok: true });
    } catch (err) {
      console.error("Błąd wysyłania zwrotu:", err.message);
      res.status(500).json({ error: "Błąd serwera. Spróbuj ponownie lub napisz bezpośrednio na kontakt@sznytdesign.pl." });
    }
  });

  // submit complaint form
  app.post("/reklamacja", formLimiter, async (req, res) => {
    const { orderNumber, name, email, description, _hp } = req.body;
    if (_hp) return res.json({ ok: true });
    if (!orderNumber || !name || !email || !description) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }
    try {
      await mailer.send({
        to: process.env.CONTACT_RECIPIENT,
        replyTo: email,
        ...renderComplaintRequest({ orderNumber, name, email, description }),
      });
      res.json({ ok: true });
    } catch (err) {
      console.error("Błąd wysyłania reklamacji:", err.message);
      res.status(500).json({ error: "Błąd serwera. Spróbuj ponownie lub napisz bezpośrednio na kontakt@sznytdesign.pl." });
    }
  });

  return app;
}
