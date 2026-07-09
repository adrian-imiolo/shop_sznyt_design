import { metaRowHtml, sectionHeadingHtml, textBlockToHtml, wrapHtml } from "./layout.ts";
import type { RenderedEmail } from "./types.ts";

export interface ComplaintRequestData {
  orderNumber: string;
  name: string;
  email: string;
  description: string;
}

export function renderComplaintRequest(data: ComplaintRequestData): RenderedEmail {
  const subject = `Reklamacja — zamówienie #${data.orderNumber}`;

  const html = wrapHtml({
    title: "Zgłoszenie reklamacji",
    bodyHtml: `
      ${metaRowHtml("Numer zamówienia", `#${data.orderNumber}`)}
      ${metaRowHtml("Imię i nazwisko", data.name)}
      ${metaRowHtml("Email", data.email)}
      ${sectionHeadingHtml("Opis problemu")}
      <p style="margin:0;">${textBlockToHtml(data.description)}</p>
      <p style="margin:24px 0 0;">Klient zostanie poproszony o przesłanie zdjęć jako odpowiedź na ten email.</p>
    `,
  });

  const text = `ZGŁOSZENIE REKLAMACJI\n\nNumer zamówienia: #${data.orderNumber}\nImię i nazwisko: ${data.name}\nEmail: ${data.email}\n\nOpis problemu:\n${data.description}\n\nKlient zostanie poproszony o przesłanie zdjęć jako odpowiedź na ten email.`;

  return { subject, html, text };
}
