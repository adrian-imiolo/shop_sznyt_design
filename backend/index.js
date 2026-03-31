import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import cors from "cors";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const app = express();

app.use(cors({
  origin: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(clerkMiddleware());
const PORT = process.env.PORT || 3000;

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
          { expand: ["data.price.product"] },
        );

        const order = await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              stripeSessionId: session.id,
              status: "paid",
              total: session.amount_total / 100,
              customerEmail: session.customer_details?.email,
              userId: session.metadata.userId,
            },
          });

          for (const item of lineItems.data) {
            const productId = Number(item.price.product.metadata.productId);
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
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: session.customer_details?.email,
            subject: "Potwierdzenie zamówienia - Sznyt Design",
            text: `Dziękujemy za złożenie zamówienia!\n\nNumer zamówienia: ${order.id}\nSuma: ${session.amount_total / 100} PLN\n\nSkontaktujemy się wkrótce.`,
          });
        } catch (emailErr) {
          console.error("Błąd wysyłania emaila:", emailErr.message);
        }
      } catch (err) {
        console.error("Błąd przetwarzania zamówienia:", err.message);
      }
    }
    res.json({ received: true });
  },
);

app.use(express.json());

app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
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
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }
  try {
    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, message },
    });
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_RECIPIENT,
        replyTo: email,
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

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, userId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "p24", "blik"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "pln",
          product_data: {
            name: item.name,
            metadata: { productId: item.id },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/koszyk`,
      metadata: { userId: userId || null },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// get orders
app.get("/orders", requireAuth(), requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
