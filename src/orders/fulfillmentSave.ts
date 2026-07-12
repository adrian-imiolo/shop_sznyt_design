import type { FulfillmentStatus } from "@sznyt/shared";

export const FULFILLMENT_SAVE_ERROR = "Nie udało się zapisać — spróbuj ponownie.";

export type FulfillmentDraft = {
  status: FulfillmentStatus;
  tracking: string;
};

export type FulfillmentSaveState = {
  /** What the controls currently show. */
  draft: FulfillmentDraft;
  /** Last values confirmed by the backend — the revert target. */
  persisted: FulfillmentDraft;
  saving: boolean;
  error: string | null;
};

export type FulfillmentSaveAction =
  | { type: "edit"; draft: FulfillmentDraft }
  | { type: "saveStart" }
  | { type: "saveSuccess"; saved: FulfillmentDraft }
  | { type: "saveFailure" };

export function initFulfillmentSave(persisted: FulfillmentDraft): FulfillmentSaveState {
  return { draft: persisted, persisted, saving: false, error: null };
}

export function fulfillmentSaveReducer(
  state: FulfillmentSaveState,
  action: FulfillmentSaveAction,
): FulfillmentSaveState {
  switch (action.type) {
    case "edit":
      return { ...state, draft: action.draft };
    case "saveStart":
      return { ...state, saving: true };
    case "saveSuccess":
      return { ...state, persisted: action.saved, saving: false, error: null };
    case "saveFailure":
      return { ...state, draft: state.persisted, saving: false, error: FULFILLMENT_SAVE_ERROR };
  }
}

/**
 * Wraps the PATCH call and dispatches the save lifecycle. Saves can overlap
 * (the tracking input stays enabled while a save is in flight); only the
 * newest save's outcome is applied, so a slow stale response can't clobber
 * the state a later save already confirmed.
 */
export function createFulfillmentSaver(
  patch: (draft: FulfillmentDraft) => Promise<unknown>,
  dispatch: (action: FulfillmentSaveAction) => void,
) {
  let newest = 0;
  return async function saveFulfillment(draft: FulfillmentDraft): Promise<void> {
    const seq = ++newest;
    dispatch({ type: "saveStart" });
    try {
      await patch(draft);
      if (seq === newest) dispatch({ type: "saveSuccess", saved: draft });
    } catch {
      if (seq === newest) dispatch({ type: "saveFailure" });
    }
  };
}
