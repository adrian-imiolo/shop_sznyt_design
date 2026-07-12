import { describe, it, expect } from "vitest";
import { ORDER_NOTE_MAX_LENGTH } from "@sznyt/shared";
import { normalizeOrderNote } from "./orderNote.ts";

describe("normalizeOrderNote", () => {
  it("trims a valid note", () => {
    expect(normalizeOrderNote("  Proszę zostawić u sąsiada  ")).toEqual({
      ok: true,
      note: "Proszę zostawić u sąsiada",
    });
  });

  it("normalizes an absent note to null", () => {
    expect(normalizeOrderNote(undefined)).toEqual({ ok: true, note: null });
    expect(normalizeOrderNote(null)).toEqual({ ok: true, note: null });
  });

  it("normalizes a whitespace-only note to null", () => {
    expect(normalizeOrderNote("   ")).toEqual({ ok: true, note: null });
  });

  it("accepts a note exactly at the max length", () => {
    const note = "a".repeat(ORDER_NOTE_MAX_LENGTH);
    expect(normalizeOrderNote(note)).toEqual({ ok: true, note });
  });

  it("rejects a note over the max length", () => {
    const result = normalizeOrderNote("a".repeat(ORDER_NOTE_MAX_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain(String(ORDER_NOTE_MAX_LENGTH));
    }
  });

  it("rejects a non-string note", () => {
    const result = normalizeOrderNote(42);
    expect(result.ok).toBe(false);
  });
});
