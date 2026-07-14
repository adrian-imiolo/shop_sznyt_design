import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import Stripe from "stripe";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import { sendEmail } from "./emails/index.ts";
import { createApp } from "./app.js";

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

const app = createApp({
  auth: { middleware: clerkMiddleware(), requireAuth, getAuth },
  stripe,
  mailer: { send: sendEmail },
  prisma,
});

const PORT = process.env.PORT || 3000;

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
