export type ReorderableProduct = {
  id: number;
  sortOrder: number;
};

/**
 * Swaps sortOrder and array position between the item at `index` and its
 * neighbor in `direction`. Returns null at the list boundary (nothing to
 * swap) instead of mutating in place, so a caller can no-op cleanly.
 */
export function swapProductOrder<T extends ReorderableProduct>(
  products: T[],
  index: number,
  direction: "up" | "down",
): T[] | null {
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= products.length) return null;

  const updated = [...products];
  const aOrder = updated[index].sortOrder;
  const bOrder = updated[swapIndex].sortOrder;
  updated[index] = { ...updated[index], sortOrder: bOrder };
  updated[swapIndex] = { ...updated[swapIndex], sortOrder: aOrder };

  [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
  return updated;
}
