// Shared receipt fragments used by the customer confirmation and the admin
// new-order alert, so both emails always agree on what an order looks like.

import { PAYMENT_METHOD_LABELS, SHIPPING_METHOD_LABELS } from "@sznyt/shared";
import { escapeHtml, formatPln, layoutColors, sectionHeadingHtml } from "./layout.ts";
import type { OrderEmailData, ShippingAddress } from "./types.ts";

export function paymentMethodLabel(method: string | null): string {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function shippingMethodLabel(method: string | null): string {
  if (!method) return "—";
  return SHIPPING_METHOD_LABELS[method] ?? method;
}

export function shippingAddressLines(
  address: ShippingAddress,
  shippingMethod: string | null,
): string[] {
  if (!address) return [];
  const { firstName, lastName, code, name, street, postalCode, city, phone, email } = address;
  const lines: string[] = [];

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  if (fullName) lines.push(fullName);
  if (shippingMethod === "paczkomat" && code) {
    lines.push(`Paczkomat ${code}${name && name !== code ? ` — ${name}` : ""}`);
  }
  if (street) lines.push(street);
  const cityLine = [postalCode, city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (phone) lines.push(`tel. ${phone}`);
  if (email) lines.push(email);
  return lines;
}

export function orderItemsHtml(data: OrderEmailData): string {
  const rows = data.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${layoutColors.borders};">${escapeHtml(item.name)}</td>
        <td style="padding:8px 8px;border-bottom:1px solid ${layoutColors.borders};text-align:center;white-space:nowrap;">× ${escapeHtml(item.quantity)}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${layoutColors.borders};text-align:right;white-space:nowrap;">${formatPln(item.unitPrice)}</td>
      </tr>`,
    )
    .join("");

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;" role="presentation">
    ${rows}
    <tr>
      <td colspan="2" style="padding:12px 0 0;font-weight:600;">Suma</td>
      <td style="padding:12px 0 0;text-align:right;font-weight:600;white-space:nowrap;color:${layoutColors.accent};">${formatPln(data.total)}</td>
    </tr>
  </table>`;
}

export function orderItemsText(data: OrderEmailData): string {
  const rows = data.items.map(
    (item) => `- ${item.name} × ${item.quantity} — ${formatPln(item.unitPrice)}`,
  );
  return [...rows, "", `Suma: ${formatPln(data.total)}`].join("\n");
}

export function orderDetailsHtml(data: OrderEmailData): string {
  const addressLines = shippingAddressLines(data.shippingAddress, data.shippingMethod);
  const parts = [
    sectionHeadingHtml("Zamówione produkty"),
    orderItemsHtml(data),
    sectionHeadingHtml("Dostawa"),
    `<p style="margin:0 0 4px;">${escapeHtml(shippingMethodLabel(data.shippingMethod))}</p>`,
  ];
  if (addressLines.length > 0) {
    parts.push(`<p style="margin:0;">${addressLines.map(escapeHtml).join("<br>")}</p>`);
  }
  parts.push(
    sectionHeadingHtml("Płatność"),
    `<p style="margin:0;">${escapeHtml(paymentMethodLabel(data.paymentMethod))}</p>`,
  );
  return parts.join("\n");
}

export function orderDetailsText(data: OrderEmailData): string {
  const addressLines = shippingAddressLines(data.shippingAddress, data.shippingMethod);
  const sections = [
    "Zamówione produkty:",
    orderItemsText(data),
    "",
    `Dostawa: ${shippingMethodLabel(data.shippingMethod)}`,
  ];
  if (addressLines.length > 0) {
    sections.push("Adres dostawy:", addressLines.join("\n"));
  }
  sections.push(`Metoda płatności: ${paymentMethodLabel(data.paymentMethod)}`);
  return sections.join("\n");
}
