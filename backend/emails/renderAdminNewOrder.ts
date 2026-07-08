import { formatPln, metaRowHtml, wrapHtml } from "./layout.ts";
import { orderDetailsHtml, orderDetailsText } from "./orderSummary.ts";
import type { OrderEmailData, RenderedEmail } from "./types.ts";

/** Paid-order alert for the shop owners (recipient: CONTACT_RECIPIENT). */
export function renderAdminNewOrder(data: OrderEmailData): RenderedEmail {
  const subject = `Nowe zamówienie #${data.orderId} — ${formatPln(data.total)}`;

  const html = wrapHtml({
    title: `Nowe zamówienie #${data.orderId}`,
    bodyHtml: `
      ${metaRowHtml("Klient", data.customerEmail ?? "—")}
      ${orderDetailsHtml(data)}
      <p style="margin:24px 0 0;">Zamówienie czeka na realizację w panelu administracyjnym.</p>
    `,
  });

  const text = [
    "NOWE ZAMÓWIENIE",
    "",
    `Numer zamówienia: #${data.orderId}`,
    `Klient: ${data.customerEmail ?? "—"}`,
    "",
    orderDetailsText(data),
    "",
    "Zamówienie czeka na realizację w panelu administracyjnym.",
  ].join("\n");

  return { subject, html, text };
}
