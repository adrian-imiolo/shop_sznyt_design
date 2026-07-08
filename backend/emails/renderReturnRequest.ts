import { metaRowHtml, sectionHeadingHtml, textBlockToHtml, wrapHtml } from "./layout.ts";
import type { RenderedEmail } from "./types.ts";

export interface ReturnRequestData {
  orderNumber: string;
  name: string;
  email: string;
  reason: string;
  bankAccount: string;
}

export function renderReturnRequest(data: ReturnRequestData): RenderedEmail {
  const subject = `Zwrot towaru — zamówienie #${data.orderNumber}`;

  const html = wrapHtml({
    title: "Zgłoszenie zwrotu",
    bodyHtml: `
      ${metaRowHtml("Numer zamówienia", `#${data.orderNumber}`)}
      ${metaRowHtml("Imię i nazwisko", data.name)}
      ${metaRowHtml("Email", data.email)}
      ${metaRowHtml("Numer konta do zwrotu", data.bankAccount)}
      ${sectionHeadingHtml("Powód zwrotu")}
      <p style="margin:0;">${textBlockToHtml(data.reason)}</p>
    `,
  });

  const text = `ZGŁOSZENIE ZWROTU\n\nNumer zamówienia: #${data.orderNumber}\nImię i nazwisko: ${data.name}\nEmail: ${data.email}\nNumer konta do zwrotu: ${data.bankAccount}\n\nPowód zwrotu:\n${data.reason}`;

  return { subject, html, text };
}
