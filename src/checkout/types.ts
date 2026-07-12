import type { ShippingMethod } from "@sznyt/shared";
import type { CartItem } from "../types";

/** The seven contact/address fields the customer types at checkout. */
export type CourierAddress = {
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
};

/** A paczkomat point as emitted by the easyPack widget selection. */
export type PaczkomatPoint = {
  code: string;
  name: string;
  city?: string;
};

/**
 * Everything the customer has assembled so far. Regulamin acceptance and
 * demo mode are UI gating, not draft validity, and live in the component
 * layer (ADR-0003).
 */
export type CheckoutDraft = {
  items: CartItem[];
  shippingMethod: ShippingMethod | null;
  paczkomatPoint: PaczkomatPoint | null;
  address: CourierAddress;
};

/** A draft requirement not yet fulfilled — gates the checkout button. */
export type CheckoutMissing = "shippingMethod" | "paczkomatPoint" | keyof CourierAddress;

/** Per-field format errors — gate submit and drive inline error display. */
export type CheckoutFieldErrors = Partial<Record<keyof CourierAddress, string>>;
