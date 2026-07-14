import nodemailer, { type Transporter } from "nodemailer";
import type { RenderedEmail } from "./types.ts";

// Created lazily: index.js calls dotenv.config() after its imports resolve,
// so SMTP_* env vars are not set yet at module-load time.
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const port = Number(process.env.SMTP_PORT);
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades via STARTTLS (nodemailer's default).
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export interface SendEmailOptions extends RenderedEmail {
  to: string;
  replyTo?: string;
}

/** The mailer seam injected into createApp — tests swap in a capture-mailer. */
export interface Mailer {
  send(options: SendEmailOptions): Promise<unknown>;
}

/** The only code path that touches the nodemailer transport. */
export async function sendEmail({ to, replyTo, subject, html, text }: SendEmailOptions) {
  if (!process.env.SMTP_HOST) {
    console.log(`[demo] sendEmail skipped — to=${to} subject=${subject}`);
    return;
  }
  return getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to,
    ...(replyTo ? { replyTo } : {}),
    subject,
    html,
    text,
  });
}
