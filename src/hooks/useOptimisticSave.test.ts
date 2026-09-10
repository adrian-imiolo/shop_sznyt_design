import { describe, it, expect, vi } from "vitest";
import {
  createOptimisticSaver,
  optimisticSaveReducer,
  initOptimisticSave,
  type OptimisticSaveState,
} from "./useOptimisticSave";

type Draft = { value: string };

const ERROR = "save failed";
const persisted: Draft = { value: "a" };

describe("optimisticSaveReducer", () => {
  it("reverts the draft to the last persisted value and shows an error when a save fails", () => {
    let state = initOptimisticSave(persisted);
    state = optimisticSaveReducer(state, { type: "edit", draft: { value: "b" } });
    state = optimisticSaveReducer(state, { type: "saveStart" });

    state = optimisticSaveReducer(state, { type: "saveFailure", error: ERROR });

    expect(state.draft).toEqual({ value: "a" });
    expect(state.error).toBe(ERROR);
    expect(state.saving).toBe(false);
  });

  it("clears the error and advances the revert target on a successful save", () => {
    let state = initOptimisticSave(persisted);
    state = optimisticSaveReducer(state, { type: "saveFailure", error: ERROR });

    const saved: Draft = { value: "b" };
    state = optimisticSaveReducer(state, { type: "edit", draft: saved });
    state = optimisticSaveReducer(state, { type: "saveStart" });
    state = optimisticSaveReducer(state, { type: "saveSuccess", saved });

    expect(state.error).toBeNull();
    expect(state.saving).toBe(false);
    expect(state.persisted).toEqual(saved);

    // a later failure now reverts to the newly confirmed value, not the original
    state = optimisticSaveReducer(state, { type: "edit", draft: { value: "c" } });
    state = optimisticSaveReducer(state, { type: "saveFailure", error: ERROR });
    expect(state.draft).toEqual(saved);
  });

  it("keeps edits typed while a save is in flight when that save succeeds", () => {
    let state = initOptimisticSave(persisted);
    const saved: Draft = { value: "b" };
    state = optimisticSaveReducer(state, { type: "edit", draft: saved });
    state = optimisticSaveReducer(state, { type: "saveStart" });
    state = optimisticSaveReducer(state, { type: "edit", draft: { value: "b2" } });

    state = optimisticSaveReducer(state, { type: "saveSuccess", saved });

    expect(state.draft).toEqual({ value: "b2" });
    expect(state.persisted).toEqual(saved);
  });
});

describe("createOptimisticSaver", () => {
  function harness(patch: (draft: Draft) => Promise<unknown>) {
    let state: OptimisticSaveState<Draft> = initOptimisticSave(persisted);
    const save = createOptimisticSaver<Draft>(
      patch,
      (action) => {
        state = optimisticSaveReducer(state, action);
      },
      ERROR,
    );
    // mirrors a component: dispatch an edit, then trigger the save
    function editAndSave(draft: Draft) {
      state = optimisticSaveReducer(state, { type: "edit", draft });
      return save(draft);
    }
    return { editAndSave, getState: () => state };
  }

  it("commits the saved draft when the patch resolves", async () => {
    const { editAndSave, getState } = harness(() => Promise.resolve());
    const draft: Draft = { value: "b" };

    await editAndSave(draft);

    expect(getState().persisted).toEqual(draft);
    expect(getState().draft).toEqual(draft);
    expect(getState().error).toBeNull();
  });

  it("reverts and surfaces the error when the patch rejects", async () => {
    const { editAndSave, getState } = harness(() => Promise.reject(new Error("boom")));

    await editAndSave({ value: "b" });

    expect(getState().draft).toEqual(persisted);
    expect(getState().error).toBe(ERROR);
    expect(getState().saving).toBe(false);
  });

  it("ignores a stale failure that resolves after a newer save succeeded", async () => {
    let failFirst: (reason: Error) => void = () => {};
    const patch = vi
      .fn<(draft: Draft) => Promise<unknown>>()
      .mockImplementationOnce(
        () => new Promise((_, reject) => { failFirst = reject; }),
      )
      .mockResolvedValueOnce(undefined);
    const { editAndSave, getState } = harness(patch);

    const first = editAndSave({ value: "b1" });
    await editAndSave({ value: "b2" });
    failFirst(new Error("token expired"));
    await first;

    expect(getState().draft).toEqual({ value: "b2" });
    expect(getState().persisted).toEqual({ value: "b2" });
    expect(getState().error).toBeNull();
  });
});
