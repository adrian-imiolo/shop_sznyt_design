import { ORDER_NOTE_MAX_LENGTH } from "@sznyt/shared";

export type NormalizeOrderNoteResult =
  | { ok: true; note: string | null }
  | { ok: false; status: 400; error: string };

/**
 * Validate the optional customer note from the checkout request body.
 * Absent or blank collapses to null; the length cap is enforced here because
 * the client-side maxLength is bypassable and Stripe metadata would reject
 * oversized values at session creation with an opaque error.
 */
export function normalizeOrderNote(raw: unknown): NormalizeOrderNoteResult {
  if (raw === undefined || raw === null) return { ok: true, note: null };

  if (typeof raw !== "string") {
    return { ok: false, status: 400, error: "Nieprawidłowe uwagi do zamówienia" };
  }

  const note = raw.trim();
  if (note === "") return { ok: true, note: null };

  if (note.length > ORDER_NOTE_MAX_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `Uwagi do zamówienia mogą mieć maksymalnie ${ORDER_NOTE_MAX_LENGTH} znaków`,
    };
  }

  return { ok: true, note };
}
