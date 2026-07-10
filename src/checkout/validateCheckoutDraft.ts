import type { AddressErrors, AddressField, CheckoutDraft } from "./types";

export type MissingRequirement = "shippingMethod" | "paczkomatPoint" | AddressField;

/**
 * The single validity notion, one evaluation, two derived views (ADR-0003):
 * `missing` is completeness and drives the checkout button; `fieldErrors` is
 * format and drives the submit guard plus per-field messages. Deriving both
 * from one call is what keeps the button provably consistent with submit.
 */
export type CheckoutValidity = {
  missing: MissingRequirement[];
  fieldErrors: AddressErrors;
};

export function validateCheckoutDraft(draft: CheckoutDraft): CheckoutValidity {
  const missing: MissingRequirement[] = [];

  if (!draft.shippingMethod) missing.push("shippingMethod");
  if (draft.shippingMethod === "paczkomat" && !draft.paczkomatPoint) missing.push("paczkomatPoint");
  for (const [field, value] of Object.entries(draft.address) as [AddressField, string][]) {
    if (value.trim() === "") missing.push(field);
  }

  const { email, postalCode, phone } = draft.address;
  const fieldErrors: AddressErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Podaj poprawny adres e-mail";
  }
  if (!/^\d{2}-\d{3}$/.test(postalCode)) {
    fieldErrors.postalCode = "Kod pocztowy powinien mieć format XX-XXX";
  }
  if (!/^(\+48\s?)?(\d[\s-]?){9}$/.test(phone.replace(/\s|-/g, ""))) {
    fieldErrors.phone = "Podaj poprawny numer telefonu (9 cyfr)";
  }

  return { missing, fieldErrors };
}
