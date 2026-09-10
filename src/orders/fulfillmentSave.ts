import type { FulfillmentStatus } from "@sznyt/shared";
import { useOptimisticSave } from "../hooks/useOptimisticSave";

export const FULFILLMENT_SAVE_ERROR = "Nie udało się zapisać — spróbuj ponownie.";

export type FulfillmentDraft = {
  status: FulfillmentStatus;
  tracking: string;
};

export function useFulfillmentSave(
  persisted: FulfillmentDraft,
  patch: (draft: FulfillmentDraft) => Promise<unknown>,
) {
  return useOptimisticSave(persisted, patch, FULFILLMENT_SAVE_ERROR);
}
