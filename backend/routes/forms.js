import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  renderContactNotification,
  renderReturnRequest,
  renderComplaintRequest,
} from "../emails/index.ts";

/**
 * Public form routes (issue #108): contact, return (zwrot), and complaint
 * (reklamacja). Handlers moved verbatim from app.js. All three share one
 * rate-limit bucket, as before — a burst on any form counts against the same
 * per-IP limit.
 *
 * @param {object} deps
 * @param {object} deps.prisma
 * @param {{ send: Function }} deps.mailer
 */
export function createFormsRouter({ prisma, mailer }) {
  const router = express.Router();

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

  // submit contact form
  router.post("/contact", formLimiter, async (req, res) => {
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

  // submit return form
  router.post("/zwrot", formLimiter, async (req, res) => {
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
  router.post("/reklamacja", formLimiter, async (req, res) => {
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

  return router;
}
