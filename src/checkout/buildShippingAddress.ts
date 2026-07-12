import type { ShippingAddress, ShippingMethod } from "@sznyt/shared";
import type { CourierAddress, PaczkomatPoint } from "./types";

/**
 * Constructs the Order's `shippingAddress` JSON — the shipping address
 * contract (CONTEXT.md glossary, ADR-0003). Explicit field-by-field so the
 * shape is visible here, not decided by spread order: the paczkomat point
 * contributes only `code` and `name`; its redundant `city` is deliberately
 * dropped in favor of the customer's own.
 */
export function buildShippingAddress(
  method: ShippingMethod,
  address: CourierAddress,
  point: PaczkomatPoint | null,
): ShippingAddress {
  const contact = {
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email,
    street: address.street,
    postalCode: address.postalCode,
    city: address.city,
    phone: address.phone,
  };

  if (method !== "paczkomat") return contact;

  if (!point) throw new Error("paczkomat shipping requires a selected point");
  return { ...contact, code: point.code, name: point.name };
}
