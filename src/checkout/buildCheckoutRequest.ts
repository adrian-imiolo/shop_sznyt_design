import type { ShippingAddress, ShippingMethod } from "@sznyt/shared";
import { buildShippingAddress } from "./buildShippingAddress";
import type { CheckoutDraft } from "./types";

export type CheckoutRequestBody = {
  /** id+quantity pairs only — the backend prices from the DB. */
  items: { id: number; quantity: number }[];
  userId: string | null;
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress;
  /** Customer delivery instructions — omitted entirely when blank. */
  note?: string;
};

/**
 * Assembles the `/create-checkout-session` body from a complete draft.
 * Callers must have validated the draft first — a draft without a shipping
 * method (or a paczkomat draft without a point) is a contract violation.
 */
export function buildCheckoutRequest(
  draft: CheckoutDraft,
  userId: string | null,
  note: string,
): CheckoutRequestBody {
  if (!draft.shippingMethod) throw new Error("checkout request requires a shipping method");

  const trimmedNote = note.trim();
  return {
    items: draft.items.map(({ id, quantity }) => ({ id, quantity })),
    userId,
    shippingMethod: draft.shippingMethod,
    shippingAddress: buildShippingAddress(draft.shippingMethod, draft.address, draft.paczkomatPoint),
    ...(trimmedNote ? { note: trimmedNote } : {}),
  };
}
