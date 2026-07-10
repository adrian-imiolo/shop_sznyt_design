import type { ShippingAddress, ShippingMethod } from "@sznyt/shared";
import type { CourierAddress, PaczkomatPoint } from "./types";

/**
 * Assembles the shipping address contract (CONTEXT.md) explicitly,
 * field by field — never by spread-merging the point over the address.
 * The point's `city` is deliberately dropped: the customer's own city is
 * already in the contract, and which one survived used to depend on
 * spread order.
 */
export function buildShippingAddress(
  method: ShippingMethod | null,
  address: CourierAddress,
  point: PaczkomatPoint | null,
): ShippingAddress {
  const base: ShippingAddress = {
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email,
    street: address.street,
    postalCode: address.postalCode,
    city: address.city,
    phone: address.phone,
  };

  if (method === "paczkomat" && point) {
    return { ...base, code: point.code, name: point.name };
  }
  return base;
}
