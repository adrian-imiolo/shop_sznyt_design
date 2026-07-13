import { isShippingMethod, ORDER_NOTE_MAX_LENGTH } from "@sznyt/shared";
import type { ShippingMethod } from "@sznyt/shared";
import type { CourierAddress, PaczkomatPoint } from "./types";

/**
 * The checkout draft fields worth surviving navigation (#74). UI state
 * (fieldErrors, loading, error) and cart items are deliberately absent —
 * items already persist via CartContext.
 */
export type StoredCheckoutDraft = {
  shippingMethod: ShippingMethod | null;
  paczkomatPoint: PaczkomatPoint | null;
  address: CourierAddress;
  note: string;
};

const STORAGE_KEY = "checkout_draft";

// Record<keyof, true> so adding a CourierAddress field breaks compilation
// here — a key missing from this list would silently pass parsing half-empty.
const ADDRESS_FIELDS: Record<keyof CourierAddress, true> = {
  firstName: true, lastName: true, street: true, postalCode: true, city: true, phone: true, email: true,
};
const ADDRESS_KEYS = Object.keys(ADDRESS_FIELDS) as (keyof CourierAddress)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAddress(value: unknown): CourierAddress | null {
  if (!isRecord(value)) return null;
  const address = {} as CourierAddress;
  for (const key of ADDRESS_KEYS) {
    const field = value[key];
    if (typeof field !== "string") return null;
    address[key] = field;
  }
  return address;
}

function parsePoint(value: unknown): PaczkomatPoint | null {
  if (!isRecord(value)) return null;
  if (typeof value.code !== "string" || typeof value.name !== "string") return null;
  if (value.city !== undefined && typeof value.city !== "string") return null;
  return value.city === undefined
    ? { code: value.code, name: value.name }
    : { code: value.code, name: value.name, city: value.city };
}

/**
 * Whole-draft-or-nothing: a payload that fails any field check is discarded
 * entirely rather than partially restored — a half-restored form is more
 * confusing than an empty one, and the customer can always retype.
 */
export function parseStoredDraft(raw: string | null): StoredCheckoutDraft | null {
  if (raw === null) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(payload)) return null;

  let shippingMethod: ShippingMethod | null = null;
  if (payload.shippingMethod !== null) {
    if (typeof payload.shippingMethod !== "string" || !isShippingMethod(payload.shippingMethod)) {
      return null;
    }
    shippingMethod = payload.shippingMethod;
  }

  const paczkomatPoint = payload.paczkomatPoint === null ? null : parsePoint(payload.paczkomatPoint);
  if (payload.paczkomatPoint !== null && paczkomatPoint === null) return null;

  const address = parseAddress(payload.address);
  if (address === null) return null;

  if (typeof payload.note !== "string") return null;
  const note = payload.note.slice(0, ORDER_NOTE_MAX_LENGTH);

  return { shippingMethod, paczkomatPoint, address, note };
}

export function serializeStoredDraft(draft: StoredCheckoutDraft): string {
  return JSON.stringify(draft);
}

// sessionStorage over localStorage: the draft is PII (name, address, phone),
// so it should die with the tab, not persist across visits (#74).

export function loadCheckoutDraft(): StoredCheckoutDraft | null {
  try {
    return parseStoredDraft(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(draft: StoredCheckoutDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, serializeStoredDraft(draft));
  } catch {
    // storage unavailable (privacy mode, quota) — persistence is best-effort
  }
}

export function clearCheckoutDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}
