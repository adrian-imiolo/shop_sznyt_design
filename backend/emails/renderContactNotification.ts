import { metaRowHtml, sectionHeadingHtml, textBlockToHtml, wrapHtml } from "./layout.ts";
import type { RenderedEmail } from "./types.ts";

export interface ContactNotificationData {
  name: string;
  email: string;
  message: string;
}

export function renderContactNotification(data: ContactNotificationData): RenderedEmail {
  const subject = `Wiadomość od ${data.name} — formularz kontaktowy`;

  const html = wrapHtml({
    title: "Nowa wiadomość z formularza kontaktowego",
    bodyHtml: `
      ${metaRowHtml("Imię", data.name)}
      ${metaRowHtml("Email", data.email)}
      ${sectionHeadingHtml("Wiadomość")}
      <p style="margin:0;">${textBlockToHtml(data.message)}</p>
    `,
  });

  const text = `Imię: ${data.name}\nEmail: ${data.email}\n\nWiadomość:\n${data.message}`;

  return { subject, html, text };
}
