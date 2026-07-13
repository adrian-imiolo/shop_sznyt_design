import type { ShippingAddress, ShippingMethod } from "@sznyt/shared";
import type { CourierAddress, PaczkomatPoint } from "./types";

/**
 * Constructs the Order's `shippingAddress` JSON — the shipping address
 * contract (CONTEXT.md glossary, ADR-0003). Explicit field-by-field so the
 * shape is visible here, not decided by spread order: the paczkomat point
 * contributes only `code` and `name`; its separate `city` field is
 * deliberately dropped — the `city` key stays the customer's own, while the
 * point's city travels inside `name` ("street, city", see toPaczkomatPoint).
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
