import { metaRowHtml, wrapHtml } from "./layout.ts";
import { shippingMethodLabel } from "./orderSummary.ts";
import type { RenderedEmail } from "./types.ts";

export interface OrderShippedData {
  orderId: number;
  trackingNumber: string;
  shippingMethod: string | null;
}

export function renderOrderShipped(data: OrderShippedData): RenderedEmail {
  const subject = "Twoje zamówienie zostało wysłane — Sznyt Design";
  const carrier = shippingMethodLabel(data.shippingMethod);

  const html = wrapHtml({
    title: "Twoje zamówienie jest w drodze!",
    bodyHtml: `
      <p style="margin:0 0 16px;">Zamówienie <strong>#${data.orderId}</strong> zostało nadane.</p>
      ${metaRowHtml("Przewoźnik", carrier)}
      ${metaRowHtml("Numer przesyłki", data.trackingNumber)}
      <p style="margin:24px 0 0;">Dziękujemy za zakup!</p>
    `,
  });

  const text = [
    `Twoje zamówienie #${data.orderId} zostało wysłane.`,
    "",
    `Przewoźnik: ${carrier}`,
    `Numer przesyłki: ${data.trackingNumber}`,
    "",
    "Dziękujemy za zakup!",
  ].join("\n");

  return { subject, html, text };
}
