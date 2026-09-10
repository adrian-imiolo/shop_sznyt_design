import { useMemo, useReducer } from "react";

export type OptimisticSaveState<T> = {
  /** What the controls currently show. */
  draft: T;
  /** Last value confirmed by the backend — the revert target. */
  persisted: T;
  saving: boolean;
  error: string | null;
};

export type OptimisticSaveAction<T> =
  | { type: "edit"; draft: T }
  | { type: "saveStart" }
  | { type: "saveSuccess"; saved: T }
  | { type: "saveFailure"; error: string };

export function initOptimisticSave<T>(persisted: T): OptimisticSaveState<T> {
  return { draft: persisted, persisted, saving: false, error: null };
}

export function optimisticSaveReducer<T>(
  state: OptimisticSaveState<T>,
  action: OptimisticSaveAction<T>,
): OptimisticSaveState<T> {
  switch (action.type) {
    case "edit":
      return { ...state, draft: action.draft };
    case "saveStart":
      return { ...state, saving: true };
    case "saveSuccess":
      return { ...state, persisted: action.saved, saving: false, error: null };
    case "saveFailure":
      return { ...state, draft: state.persisted, saving: false, error: action.error };
  }
}

/**
 * Wraps a PATCH-shaped call and dispatches the save lifecycle. Saves can
 * overlap; only the newest save's outcome is applied, so a slow stale
 * response can't clobber the state a later save already confirmed.
 */
export function createOptimisticSaver<T>(
  patch: (draft: T) => Promise<unknown>,
  dispatch: (action: OptimisticSaveAction<T>) => void,
  errorMessage: string,
) {
  let newest = 0;
  return async function save(draft: T): Promise<void> {
    const seq = ++newest;
    dispatch({ type: "saveStart" });
    try {
      await patch(draft);
      if (seq === newest) dispatch({ type: "saveSuccess", saved: draft });
    } catch {
      if (seq === newest) dispatch({ type: "saveFailure", error: errorMessage });
    }
  };
}

/**
 * Optimistic draft/persisted state for a value saved through a PATCH-shaped
 * call: edits show immediately, a failed save reverts to the last confirmed
 * value, and overlapping saves are race-safe (see createOptimisticSaver).
 */
export function useOptimisticSave<T>(
  persisted: T,
  patch: (draft: T) => Promise<unknown>,
  errorMessage: string,
) {
  const [state, dispatch] = useReducer(optimisticSaveReducer<T>, persisted, initOptimisticSave);

  const save = useMemo(
    () => createOptimisticSaver<T>(patch, dispatch, errorMessage),
    [patch, errorMessage],
  );

  function edit(draft: T) {
    dispatch({ type: "edit", draft });
  }

  return { draft: state.draft, saving: state.saving, error: state.error, edit, save };
}
