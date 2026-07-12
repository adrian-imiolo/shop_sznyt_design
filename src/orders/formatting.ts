import type { ShippingAddress } from "@sznyt/shared";

// Pure order-presentation formatters shared by every surface that renders
// an order (customer pages via OrderCard, the admin table directly).
// Addresses arrive as API JSON, so fields are Partial — the shipping
// address contract guarantees them, the wire format doesn't.

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL");
}

/**
 * One-line recipient summary for compact contexts (order list items).
 * Name appears only when complete; a bare city stands in for a missing
 * postal code — mirrors what checkout can actually produce.
 */
export function formatRecipientLine(address: Partial<ShippingAddress>): string {
  return [
    address.firstName && address.lastName
      ? `${address.firstName} ${address.lastName}`
      : null,
    address.street,
    address.postalCode && address.city
      ? `${address.postalCode} ${address.city}`
      : address.city,
    address.phone,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Paczkomat point summary, e.g. "Paczkomat: KRA010, Kraków". */
export function formatPaczkomatLine(address: Partial<ShippingAddress>): string {
  return `Paczkomat: ${address.code ?? ""}${address.city ? `, ${address.city}` : ""}`;
}
