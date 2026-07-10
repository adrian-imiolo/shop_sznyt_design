/**
 * Shipping address contract (see CONTEXT.md glossary and ADR-0003).
 *
 * The flat JSON captured at checkout and stored on the Order as
 * `shippingAddress`: seven contact/address fields always present; the
 * paczkomat point's `code` and `name` present iff the Order's
 * `shippingMethod === "paczkomat"`. Discriminated by the sibling
 * `shippingMethod`, never by its own shape — the flat form is what every
 * persisted Order row already holds, and it transits Stripe session
 * metadata (500-char value cap).
 *
 * Built only by the frontend checkout module; the backend parses and
 * renders it, never constructs it.
 */
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  /** Paczkomat point id, e.g. "KRA010" — present iff shippingMethod === "paczkomat". */
  code?: string;
  /** Paczkomat point display name — present iff shippingMethod === "paczkomat". */
  name?: string;
}
