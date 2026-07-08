import { wrapHtml } from "./layout.ts";
import { orderDetailsHtml, orderDetailsText } from "./orderSummary.ts";
import type { OrderEmailData, RenderedEmail } from "./types.ts";

export function renderOrderConfirmation(data: OrderEmailData): RenderedEmail {
  const subject = `Potwierdzenie zamówienia #${data.orderId} — Sznyt Design`;

  const html = wrapHtml({
    title: "Dziękujemy za zamówienie!",
    bodyHtml: `
      <p style="margin:0 0 8px;">Twoje zamówienie <strong>#${data.orderId}</strong> zostało opłacone i przekazane do realizacji.</p>
      ${orderDetailsHtml(data)}
      <p style="margin:24px 0 0;">Poinformujemy Cię, gdy tylko przesyłka zostanie nadana. W razie pytań po prostu odpowiedz na tę wiadomość.</p>
    `,
  });

  const text = [
    "Dziękujemy za złożenie zamówienia!",
    "",
    `Numer zamówienia: #${data.orderId}`,
    "",
    orderDetailsText(data),
    "",
    "Poinformujemy Cię, gdy przesyłka zostanie nadana.",
    "Sznyt Design — kontakt@sznytdesign.pl",
  ].join("\n");

  return { subject, html, text };
}
