import { describe, it, expect, vi } from "vitest";
import {
  createFulfillmentSaver,
  fulfillmentSaveReducer,
  initFulfillmentSave,
  FULFILLMENT_SAVE_ERROR,
  type FulfillmentDraft,
  type FulfillmentSaveState,
} from "./fulfillmentSave";

const persisted: FulfillmentDraft = { status: "received", tracking: "" };

describe("fulfillmentSaveReducer", () => {
  it("reverts the draft to the last persisted values and shows an error when a save fails", () => {
    let state = initFulfillmentSave(persisted);
    state = fulfillmentSaveReducer(state, {
      type: "edit",
      draft: { status: "shipped", tracking: "PX123" },
    });
    state = fulfillmentSaveReducer(state, { type: "saveStart" });

    state = fulfillmentSaveReducer(state, { type: "saveFailure" });

    expect(state.draft).toEqual({ status: "received", tracking: "" });
    expect(state.error).toBe(FULFILLMENT_SAVE_ERROR);
    expect(state.saving).toBe(false);
  });

  it("clears the error and advances the revert target on a successful save", () => {
    let state = initFulfillmentSave(persisted);
    state = fulfillmentSaveReducer(state, { type: "saveFailure" });

    const saved: FulfillmentDraft = { status: "shipped", tracking: "PX123" };
    state = fulfillmentSaveReducer(state, {
      type: "edit",
      draft: saved,
    });
    state = fulfillmentSaveReducer(state, { type: "saveStart" });
    state = fulfillmentSaveReducer(state, { type: "saveSuccess", saved });

    expect(state.error).toBeNull();
    expect(state.saving).toBe(false);
    expect(state.persisted).toEqual(saved);

    // a later failure now reverts to the newly confirmed values, not the originals
    state = fulfillmentSaveReducer(state, {
      type: "edit",
      draft: { status: "received", tracking: "PX123" },
    });
    state = fulfillmentSaveReducer(state, { type: "saveFailure" });
    expect(state.draft).toEqual(saved);
  });

  it("keeps edits typed while a save is in flight when that save succeeds", () => {
    let state = initFulfillmentSave(persisted);
    const saved: FulfillmentDraft = { status: "received", tracking: "PX1" };
    state = fulfillmentSaveReducer(state, { type: "edit", draft: saved });
    state = fulfillmentSaveReducer(state, { type: "saveStart" });
    state = fulfillmentSaveReducer(state, {
      type: "edit",
      draft: { status: "received", tracking: "PX12" },
    });

    state = fulfillmentSaveReducer(state, { type: "saveSuccess", saved });

    expect(state.draft).toEqual({ status: "received", tracking: "PX12" });
    expect(state.persisted).toEqual(saved);
  });
});

describe("createFulfillmentSaver", () => {
  function harness(patch: (draft: FulfillmentDraft) => Promise<unknown>) {
    let state: FulfillmentSaveState = initFulfillmentSave(persisted);
    const save = createFulfillmentSaver(patch, (action) => {
      state = fulfillmentSaveReducer(state, action);
    });
    // mirrors the component: controls dispatch an edit, then trigger the save
    function editAndSave(draft: FulfillmentDraft) {
      state = fulfillmentSaveReducer(state, { type: "edit", draft });
      return save(draft);
    }
    return { editAndSave, getState: () => state };
  }

  it("commits the saved draft when the PATCH resolves", async () => {
    const { editAndSave, getState } = harness(() => Promise.resolve());
    const draft: FulfillmentDraft = { status: "shipped", tracking: "PX123" };

    await editAndSave(draft);

    expect(getState().persisted).toEqual(draft);
    expect(getState().draft).toEqual(draft);
    expect(getState().error).toBeNull();
  });

  it("reverts and surfaces the error when the PATCH rejects", async () => {
    const { editAndSave, getState } = harness(() => Promise.reject(new Error("boom")));

    await editAndSave({ status: "shipped", tracking: "PX123" });

    expect(getState().draft).toEqual(persisted);
    expect(getState().error).toBe(FULFILLMENT_SAVE_ERROR);
    expect(getState().saving).toBe(false);
  });

  it("ignores a stale failure that resolves after a newer save succeeded", async () => {
    let failFirst: (reason: Error) => void = () => {};
    const patch = vi
      .fn<(draft: FulfillmentDraft) => Promise<unknown>>()
      .mockImplementationOnce(
        () => new Promise((_, reject) => { failFirst = reject; }),
      )
      .mockResolvedValueOnce(undefined);
    const { editAndSave, getState } = harness(patch);

    const first = editAndSave({ status: "shipped", tracking: "PX1" });
    await editAndSave({ status: "shipped", tracking: "PX123" });
    failFirst(new Error("token expired"));
    await first;

    expect(getState().draft).toEqual({ status: "shipped", tracking: "PX123" });
    expect(getState().persisted).toEqual({ status: "shipped", tracking: "PX123" });
    expect(getState().error).toBeNull();
  });
});
