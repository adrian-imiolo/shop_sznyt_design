import type { CheckoutDraft, CheckoutFieldErrors, CheckoutMissing, CourierAddress } from "./types";

export type CheckoutValidation = {
  /** Unfulfilled draft requirements — gates the checkout button. */
  missing: CheckoutMissing[];
  /** Format errors — gate submit and drive per-field error display. */
  fieldErrors: CheckoutFieldErrors;
};

const ADDRESS_KEYS: (keyof CourierAddress)[] = [
  "firstName",
  "lastName",
  "email",
  "street",
  "postalCode",
  "city",
  "phone",
];

/**
 * The single validity notion for the checkout draft (ADR-0003): one
 * evaluation, two derived views. Completeness (`missing`) and format
 * (`fieldErrors`) are independent — a filled-but-malformed draft enables
 * the button yet fails submit, preserving the two-stage UX.
 */
export function validateCheckoutDraft(draft: CheckoutDraft): CheckoutValidation {
  const missing: CheckoutMissing[] = [];

  if (!draft.shippingMethod) missing.push("shippingMethod");
  if (draft.shippingMethod === "paczkomat" && !draft.paczkomatPoint) missing.push("paczkomatPoint");
  for (const key of ADDRESS_KEYS) {
    if (draft.address[key].trim() === "") missing.push(key);
  }

  const fieldErrors: CheckoutFieldErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.address.email)) {
    fieldErrors.email = "Podaj poprawny adres e-mail";
  }
  if (!/^\d{2}-\d{3}$/.test(draft.address.postalCode)) {
    fieldErrors.postalCode = "Kod pocztowy powinien mieć format XX-XXX";
  }
  if (!/^(\+48)?\d{9}$/.test(draft.address.phone.replace(/[\s-]/g, ""))) {
    fieldErrors.phone = "Podaj poprawny numer telefonu (9 cyfr)";
  }

  return { missing, fieldErrors };
}
