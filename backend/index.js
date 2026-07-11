import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import cors from "cors";
import Stripe from "stripe";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import { rateLimit } from "express-rate-limit";
import {
  sendEmail,
  renderOrderShipped,
  renderContactNotification,
  renderReturnRequest,
  renderComplaintRequest,
} from "./emails/index.ts";
import {
  buildCheckoutLineItems,
  paidOrderFactsFromSession,
  normalizeOrderNote,
  recordPaidOrder,
  notifyOrderPlaced,
} from "./orders/index.ts";
import { computeQuarterRevenue } from "./revenue/index.ts";
import { FULFILLMENT_STATUSES } from "@sznyt/shared";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const isDemoMode = !stripe || !process.env.SMTP_HOST;

// When Stripe is live, a missing webhook secret means payments succeed but orders
// are never recorded, and a missing FRONTEND_URL 500s every checkout. Fail at boot.
if (stripe && (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.FRONTEND_URL)) {
  console.error("FATAL: STRIPE_WEBHOOK_SECRET and FRONTEND_URL are required when STRIPE_SECRET_KEY is set.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const app = express();

// Render/Railway sit behind exactly one proxy hop — required for
// express-rate-limit to see real client IPs instead of the proxy's.
app.set("trust proxy", 1);

// Public forms trigger outbound SMTP + DB writes; checkout calls Stripe.
// The honeypot filters dumb bots, this stops dumb loops.
const formLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
});
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
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
app.use(clerkMiddleware());
const PORT = process.env.PORT || 3000;

function getRole(req) {
  const { sessionClaims } = getAuth(req);
  return sessionClaims?.metadata?.role ?? null;
}

function requireAdmin(req, res, next) {
  if (getRole(req) !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

app.post(
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
      // This route is the Stripe adapter (ADR-0001): all Stripe I/O happens
      // here, then plain facts go into the order-intake module.
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
          await notifyOrderPlaced(facts, result.order.id);
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

app.use(express.json());

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
app.delete("/products/:id", requireAuth(), requireAdmin, async (req, res) => {
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
app.put("/products/:id", requireAuth(), requireAdmin, async (req, res) => {
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
app.patch("/products/reorder", requireAuth(), requireAdmin, async (req, res) => {
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

app.post("/products", requireAuth(), requireAdmin, async (req, res) => {
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
      await sendEmail({
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

app.post("/create-checkout-session", checkoutLimiter, async (req, res) => {
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

    const result = buildCheckoutLineItems(items, products, shippingMethod);
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

// quarterly DN revenue vs the registration cap — order volume is tiny at DN
// scale, so fetching all paid orders and filtering in the pure function is fine
app.get("/revenue/quarter", requireAuth(), requireAdmin, async (req, res) => {
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
app.get("/orders", requireAuth(), requireAdmin, async (req, res) => {
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
app.patch("/orders/:id/fulfillment", requireAuth(), requireAdmin, async (req, res) => {
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
        await sendEmail({
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

app.get("/orders/user/:userId", requireAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    if (getAuth(req).userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/orders/:id", requireAuth(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ error: "Nie znaleziono zamówienia" });
    // Guest orders (userId=null) are only reachable via /orders/by-session/:sessionId —
    // sequential ids must not expose their shipping data to other signed-in users.
    if (order.userId !== getAuth(req).userId) {
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
    await sendEmail({
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
    await sendEmail({
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

// Express 5 passes listen errors to this callback (and registers it as the
// server's `error` handler), so without the guard the banner prints and the
// process exits 0 even when the port is taken.
const server = app.listen(PORT, (err) => {
  if (err) return; // handled by the `error` listener below
  if (isDemoMode) {
    console.log(`[DEMO MODE] Backend on :${PORT} — Stripe: ${stripe ? "on" : "off"}, SMTP: ${process.env.SMTP_HOST ? "on" : "off"}`);
  } else {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});

server.on("error", function handleServerStartupError(err) {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use — is a stale backend instance still running? Stop it and retry.`);
  } else {
    console.error("Server failed to start:", err);
  }
  process.exit(1);
});
