import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import cors from "cors";
import nodemailer from "nodemailer";
import Stripe from "stripe";

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

app.use(cors());
const PORT = process.env.PORT || 3000;

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
      const session = event.data.object;
      await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          status: "paid",
          total: session.amount_total / 100,
        },
      });
    }
    res.json({ received: true });
  },
);

app.use(express.json());

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// get single product
app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const singleProduct = await prisma.product.findUnique({
    where: { id },
  });
  res.json(singleProduct);
});

// delete product
app.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleteProduct = await prisma.product.delete({
    where: { id },
  });
  res.json(deleteProduct);
});

//update product
app.put("/products/:id", async (req, res) => {
  const {
    name,
    tagline,
    description,
    price,
    imageUrl,
    lifestyleImageUrl,
    stock,
  } = req.body;
  const id = Number(req.params.id);
  const update = await prisma.product.update({
    where: { id },
    data: {
      name,
      tagline,
      description,
      price,
      imageUrl,
      lifestyleImageUrl,
      stock,
    },
  });
  res.json(update);
});

app.post("/products", async (req, res) => {
  const {
    name,
    tagline,
    description,
    price,
    imageUrl,
    lifestyleImageUrl,
    stock,
  } = req.body;
  const product = await prisma.product.create({
    data: {
      name,
      tagline,
      description,
      price,
      imageUrl,
      lifestyleImageUrl,
      stock,
    },
  });
  res.json(product);
});

// submit contact form with data
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  const contactMessage = await prisma.contactMessage.create({
    data: { name, email, message },
  });
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.CONTACT_RECIPIENT,
    replyTo: email,
    text: `Imię: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`,
  });
  res.json(contactMessage);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "p24", "blik"],
    line_items: items.map((item) => ({
      price_data: {
        currency: "pln",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: "https://localhost:5173/sukces",
    cancel_url: "https://localhost:5173/koszyk",
  });
  res.json({ url: session.url });
});

// get orders
app.get("/orders", async (req, res) => {
  const orders = await prisma.order.findMany();
  res.json(orders);
});
