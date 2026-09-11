import type { CartItem } from "../types";

/**
 * The cart's state. `lastAdd` counts successful adds — it is the signal the
 * add-to-cart toast listens to, kept in state rather than returned from
 * `addItem` so it is computed against the pending cart instead of a render
 * closure (#167). The counter's value carries no meaning; only its changes do.
 */
export type CartState = {
  items: CartItem[];
  lastAdd: number;
};

/**
 * Applies an add and records whether it landed. Returns `prev` unchanged when
 * the stock guard rejects the add, so React bails out of the re-render and the
 * toast stays silent about something that did not happen.
 */
export function addItemToState(
  prev: CartState,
  newItem: Omit<CartItem, "quantity">,
): CartState {
  const items = addToCart(prev.items, newItem);
  if (items === prev.items) return prev;

  return { items, lastAdd: prev.lastAdd + 1 };
}

export function addToCart(
  items: CartItem[],
  newItem: Omit<CartItem, "quantity">,
): CartItem[] {
  const existing = items.find((i) => i.id === newItem.id);
  if (existing) {
    if (existing.quantity >= existing.stock) return items;
    return items.map((i) =>
      i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i,
    );
  }
  if (newItem.stock === 0) return items;
  return [...items, { ...newItem, quantity: 1 }];
}

export function mergeDuplicateItems(items: CartItem[]): CartItem[] {
  const merged: CartItem[] = [];
  for (const item of items) {
    const existing = merged.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, existing.stock);
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}
