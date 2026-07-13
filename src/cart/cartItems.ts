import type { CartItem } from "../types";

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
