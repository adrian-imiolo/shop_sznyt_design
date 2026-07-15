import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  renderContactNotification,
  renderReturnRequest,
  renderComplaintRequest,
} from "../emails/index.ts";

/**
 * Public form routes (issue #108): contact, return (zwrot), and complaint
 * (reklamacja). All three share one rate-limit bucket — a burst on any form
 * counts against the same per-IP limit. Contact failures propagate to the
 * shared serverError middleware (issue #115); zwrot/reklamacja keep local
 * catches because their 500 body carries a fallback contact address.
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
  router.post("/contact", formLimiter, async function submitContact(req, res) {
    const { name, email, message, _hp } = req.body;
    if (_hp) return res.json({ ok: true });
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }
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
  });

  // submit return form
  router.post("/zwrot", formLimiter, async function submitReturn(req, res) {
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
  router.post("/reklamacja", formLimiter, async function submitComplaint(req, res) {
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
