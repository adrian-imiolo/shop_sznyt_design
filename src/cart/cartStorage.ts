import type { CartItem } from "../types";
import { mergeDuplicateItems } from "./cartItems";

const STORAGE_KEY = "cart";

/**
 * Merge, not just parse — carts saved before #70 may hold duplicate lines.
 * Anything that isn't a JSON array is discarded whole; the shopper can
 * always re-add items, a corrupted cart cannot be repaired.
 */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (raw === null) return [];
  try {
    const payload: unknown = JSON.parse(raw);
    return Array.isArray(payload) ? mergeDuplicateItems(payload) : [];
  } catch {
    return [];
  }
}

export function loadCart(): CartItem[] {
  try {
    return parseStoredCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (privacy mode, quota) — persistence is best-effort
  }
}
