import type { ShippingMethod } from "@sznyt/shared";

/** The seven contact/address fields collected for every order. */
export type CourierAddress = {
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
};

/** A paczkomat selected in the easyPack widget. */
export type PaczkomatPoint = {
  code: string;
  name: string;
  city?: string;
};

/** Everything the customer has entered so far — the input to validation and assembly. */
export type CheckoutDraft = {
  shippingMethod: ShippingMethod | null;
  paczkomatPoint: PaczkomatPoint | null;
  address: CourierAddress;
};

export type AddressField = keyof CourierAddress;

export type AddressErrors = Partial<Record<AddressField, string>>;

export const EMPTY_ADDRESS: CourierAddress = {
  firstName: "",
  lastName: "",
  street: "",
  postalCode: "",
  city: "",
  phone: "",
  email: "",
};
