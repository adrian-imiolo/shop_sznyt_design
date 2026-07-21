import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  CONTACT_FORM_FIELDS,
  RETURN_FORM_FIELDS,
  COMPLAINT_FORM_FIELDS,
} from "@sznyt/shared";
import {
  renderContactNotification,
  renderReturnRequest,
  renderComplaintRequest,
} from "../emails/index.ts";

/**
 * How a form responds when the notification email fails to send (issue #133).
 * The difference is intentional and load-bearing — do not unify:
 *
 * - "email-is-best-effort": the submission already succeeded (contact stores
 *   the message in the DB first), so a send failure is logged and the response
 *   still succeeds. Everything outside the send — the DB write included —
 *   propagates to the shared serverError middleware (issue #115).
 * - "fallback-address-500": nothing was persisted, so a send failure loses the
 *   request — answer 500 with a body carrying the fallback contact address.
 */
const CATCH_POLICIES = ["email-is-best-effort", "fallback-address-500"];

const FALLBACK_ADDRESS_ERROR =
  "Błąd serwera. Spróbuj ponownie lub napisz bezpośrednio na kontakt@sznytdesign.pl.";

/**
 * Public form routes (issue #108): contact, return (zwrot), and complaint
 * (reklamacja). Each form is a declaration of { fields, render, catchPolicy }
 * over one shared skeleton (issue #133): honeypot check → required-fields
 * guard → optional persist → render → send. Required-field lists come from
 * @sznyt/shared so the frontend submit bodies are typed from the same source.
 *
 * All three share one rate-limit bucket — a burst on any form counts against
 * the same per-IP limit.
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

  /**
   * @param {string} path
   * @param {object} form
   * @param {readonly string[]} form.fields required fields; missing any → 400.
   *   Must include "email" — the skeleton sets it as the notification's replyTo
   * @param {(data: object) => object} form.render email renderer for the picked fields
   * @param {"email-is-best-effort" | "fallback-address-500"} form.catchPolicy
   * @param {(data: object) => Promise<object>} [form.persist] runs before the
   *   send, outside its catch; its return value becomes the response body
   */
  function defineFormRoute(path, { fields, render, catchPolicy, persist }) {
    if (!CATCH_POLICIES.includes(catchPolicy)) {
      throw new Error(`Unknown catchPolicy for ${path}: ${catchPolicy}`);
    }

    router.post(path, formLimiter, async function submitForm(req, res) {
      if (req.body._hp) return res.json({ ok: true });
      if (fields.some((field) => !req.body[field])) {
        return res.status(400).json({ error: "Wszystkie pola są wymagane." });
      }
      const data = Object.fromEntries(fields.map((field) => [field, req.body[field]]));

      const record = persist ? await persist(data) : null;
      // No recipient means demo mode: the boot check (config/bootEnv.ts) makes
      // an unset CONTACT_RECIPIENT fatal as soon as SMTP is configured, so the
      // send would have been skipped by sendEmail anyway. Skipping it here
      // keeps an undefined recipient out of the mailer contract (issue #143).
      const recipient = process.env.CONTACT_RECIPIENT;
      if (recipient) {
        try {
          await mailer.send({
            to: recipient,
            replyTo: data.email,
            ...render(data),
          });
        } catch (err) {
          console.error(`Błąd wysyłania emaila (${path}):`, err.message);
          if (catchPolicy === "fallback-address-500") {
            return res.status(500).json({ error: FALLBACK_ADDRESS_ERROR });
          }
        }
      } else {
        console.log(`[demo] notification skipped (${path}) — CONTACT_RECIPIENT not set`);
      }
      res.json(record ?? { ok: true });
    });
  }

  defineFormRoute("/contact", {
    fields: CONTACT_FORM_FIELDS,
    render: renderContactNotification,
    catchPolicy: "email-is-best-effort",
    persist: function storeContactMessage(data) {
      return prisma.contactMessage.create({ data });
    },
  });

  defineFormRoute("/zwrot", {
    fields: RETURN_FORM_FIELDS,
    render: renderReturnRequest,
    catchPolicy: "fallback-address-500",
  });

  defineFormRoute("/reklamacja", {
    fields: COMPLAINT_FORM_FIELDS,
    render: renderComplaintRequest,
    catchPolicy: "fallback-address-500",
  });

  return router;
}
