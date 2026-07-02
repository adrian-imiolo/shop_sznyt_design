import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import cors from "cors";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import { rateLimit } from "express-rate-limit";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const isDemoMode = !stripe || !process.env.SMTP_HOST;

// When Stripe is live, a missing webhook secret means payments succeed but orders
// are never recorded, and a missing FRONTEND_URL 500s every checkout. Fail at boot.
if (stripe && (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.FRONTEND_URL)) {
  console.error("FATAL: STRIPE_WEBHOOK_SECRET and FRONTEND_URL are required when STRIPE_SECRET_KEY is set.");
  process.exit(1);
}

async function sendMail(opts) {
  if (!process.env.SMTP_HOST) {
    console.log(`[demo] sendMail skipped — to=${opts.to} subject=${opts.subject ?? "(no subject)"}`);
    return;
  }
  return transporter.sendMail({ from: process.env.SMTP_USER, ...opts });
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

const SHIPPING_COSTS = {
  paczkomat: 20,
  inpost_kurier: 25,
  dpd: 25,
};
const FREE_SHIPPING_THRESHOLD = 350;

const SHIPPING_LABELS = {
  paczkomat: "InPost Paczkomat",
  inpost_kurier: "InPost Kurier",
  dpd: "DPD Kurier",
};

function requireAdmin(req, res, next) {
  const { userId } = getAuth(req);
  if (userId !== process.env.ADMIN_USER_ID) {
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

        const order = await prisma.$transaction(async (tx) => {
          const shippingAddress = session.metadata.shippingAddress
            ? JSON.parse(session.metadata.shippingAddress)
            : null;

          const newOrder = await tx.order.create({
            data: {
              stripeSessionId: session.id,
              status: "paid",
              total: session.amount_total / 100,
              customerEmail: session.customer_details?.email,
              userId: session.metadata.userId,
              shippingMethod: session.metadata.shippingMethod || null,
              shippingAddress,
              paymentMethod,
            },
          });

          for (const item of lineItems.data) {
            const productId = Number(item.price.product.metadata.productId);
            if (!productId) continue; // skip shipping line item

            const quantity = item.quantity;
            const price = item.price.unit_amount / 100;

            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId,
                quantity,
                price,
              },
            });

            await tx.product.update({
              where: { id: productId },
              data: { stock: { decrement: quantity } },
            });
          }

          return newOrder;
        });

        try {
          await sendMail({
            to: session.customer_details?.email,
            subject: "Potwierdzenie zamówienia - Sznyt Design",
            text: `Dziękujemy za złożenie zamówienia!\n\nNumer zamówienia: ${order.id}\nSuma: ${session.amount_total / 100} PLN\n\nSkontaktujemy się wkrótce.`,
          });
        } catch (emailErr) {
          console.error("Błąd wysyłania emaila:", emailErr.message);
        }
      } catch (err) {
        // P2002 on stripeSessionId = webhook retry for an already-recorded order — safe no-op.
        // Anything else must return 500 so Stripe retries; a swallowed error here
        // permanently loses a paid order.
        if (err.code !== "P2002") {
          console.error("Błąd przetwarzania zamówienia:", err.message);
          return res.status(500).json({ error: "Order processing failed" });
        }
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
      await sendMail({
        to: process.env.CONTACT_RECIPIENT,
        replyTo: email,
        subject: `Wiadomość od ${name} — formularz kontaktowy`,
        text: `Imię: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`,
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
    const { items, userId, shippingMethod, shippingAddress } = req.body;

    if (!shippingMethod || !SHIPPING_COSTS[shippingMethod]) {
      return res.status(400).json({ error: "Wybierz metodę dostawy" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Koszyk jest pusty" });
    }

    // Prices, names and images come from the DB — the client only chooses ids and quantities.
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((item) => Number(item.id)) } },
    });
    const productsById = new Map(products.map((p) => [p.id, p]));

    const orderLines = [];
    for (const item of items) {
      const product = productsById.get(Number(item.id));
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Nieprawidłowy produkt w koszyku" });
      }
      if (quantity > product.stock) {
        return res.status(409).json({
          error: `Niewystarczająca ilość produktu „${product.name}" — dostępne sztuki: ${product.stock}`,
        });
      }
      orderLines.push({ product, quantity });
    }

    const subtotal = orderLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COSTS[shippingMethod];

    const lineItems = orderLines.map(({ product, quantity }) => ({
      price_data: {
        currency: "pln",
        product_data: {
          name: product.name,
          ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
          metadata: { productId: product.id },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "pln",
          product_data: {
            name: `Dostawa — ${SHIPPING_LABELS[shippingMethod]}`,
            metadata: {},
          },
          unit_amount: shippingCost * 100,
        },
        quantity: 1,
      });
    }

    const customerEmail = shippingAddress?.email || undefined;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "p24", "blik"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customerEmail,
      success_url: `${process.env.FRONTEND_URL}/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/koszyk`,
      metadata: {
        ...(userId ? { userId } : {}),
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

    const VALID_STATUSES = ["received", "processing", "shipped", "delivered"];
    if (!VALID_STATUSES.includes(fulfillmentStatus)) {
      return res.status(400).json({ error: "Nieprawidłowy status" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { fulfillmentStatus, trackingNumber: trackingNumber || null },
    });

    // send shipping email when status set to shipped and we have customer email + tracking number
    if (fulfillmentStatus === "shipped" && order.customerEmail && trackingNumber) {
      try {
        await sendMail({
          to: order.customerEmail,
          subject: "Twoje zamówienie zostało wysłane — Sznyt Design",
          text: `Twoje zamówienie #${order.id} zostało wysłane.\n\nNumer przesyłki: ${trackingNumber}\n\nDziękujemy za zakup!`,
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
    await sendMail({
      to: process.env.CONTACT_RECIPIENT,
      replyTo: email,
      subject: `Zwrot towaru — zamówienie #${orderNumber}`,
      text: `ZGŁOSZENIE ZWROTU\n\nNumer zamówienia: #${orderNumber}\nImię i nazwisko: ${name}\nEmail: ${email}\nNumer konta do zwrotu: ${bankAccount}\n\nPowód zwrotu:\n${reason}`,
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
    await sendMail({
      to: process.env.CONTACT_RECIPIENT,
      replyTo: email,
      subject: `Reklamacja — zamówienie #${orderNumber}`,
      text: `ZGŁOSZENIE REKLAMACJI\n\nNumer zamówienia: #${orderNumber}\nImię i nazwisko: ${name}\nEmail: ${email}\n\nOpis problemu:\n${description}\n\nKlient zostanie poproszony o przesłanie zdjęć jako odpowiedź na ten email.`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Błąd wysyłania reklamacji:", err.message);
    res.status(500).json({ error: "Błąd serwera. Spróbuj ponownie lub napisz bezpośrednio na kontakt@sznytdesign.pl." });
  }
});

app.listen(PORT, () => {
  if (isDemoMode) {
    console.log(`[DEMO MODE] Backend on :${PORT} — Stripe: ${stripe ? "on" : "off"}, SMTP: ${process.env.SMTP_HOST ? "on" : "off"}`);
  } else {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});
