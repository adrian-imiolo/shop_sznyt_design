import type { ShippingAddress, ShippingMethod } from "@sznyt/shared";
import { buildShippingAddress } from "./buildShippingAddress";
import type { CheckoutDraft } from "./types";

export type CheckoutRequestBody = {
  /** Ids and quantities only — the backend prices from the DB (line-item contract). */
  items: { id: number; quantity: number }[];
  userId: string | null | undefined;
  shippingMethod: ShippingMethod | null;
  shippingAddress: ShippingAddress;
};

export function buildCheckoutRequest<Item extends { id: number; quantity: number }>(
  items: Item[],
  userId: string | null | undefined,
  draft: CheckoutDraft,
): CheckoutRequestBody {
  return {
    items: items.map(({ id, quantity }) => ({ id, quantity })),
    userId,
    shippingMethod: draft.shippingMethod,
    shippingAddress: buildShippingAddress(draft.shippingMethod, draft.address, draft.paczkomatPoint),
  };
}
