import type { CartItem } from "../types";
import { mergeDuplicateItems } from "./cartItems";

const STORAGE_KEY = "cart";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.imageUrl === "string" &&
    typeof item.quantity === "number" &&
    typeof item.stock === "number"
  );
}

/**
 * Whole-cart-or-nothing, like parseStoredDraft: any malformed entry
 * discards the lot — the shopper can re-add items, a corrupted cart
 * cannot be repaired. Merge, not just parse — carts saved before #70
 * may hold duplicate lines.
 */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (raw === null) return [];
  try {
    const payload: unknown = JSON.parse(raw);
    if (!Array.isArray(payload) || !payload.every(isCartItem)) return [];
    return mergeDuplicateItems(payload);
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
