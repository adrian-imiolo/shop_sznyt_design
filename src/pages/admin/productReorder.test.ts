import { describe, it, expect } from "vitest";
import { swapProductOrder, type ReorderableProduct } from "./productReorder";

const products: ReorderableProduct[] = [
  { id: 1, sortOrder: 10 },
  { id: 2, sortOrder: 20 },
  { id: 3, sortOrder: 30 },
];

describe("swapProductOrder", () => {
  it("swaps sortOrder and position with the previous item when moving up", () => {
    const result = swapProductOrder(products, 1, "up");

    expect(result).toEqual([
      { id: 2, sortOrder: 10 },
      { id: 1, sortOrder: 20 },
      { id: 3, sortOrder: 30 },
    ]);
  });

  it("swaps sortOrder and position with the next item when moving down", () => {
    const result = swapProductOrder(products, 1, "down");

    expect(result).toEqual([
      { id: 1, sortOrder: 10 },
      { id: 3, sortOrder: 20 },
      { id: 2, sortOrder: 30 },
    ]);
  });

  it("returns null when moving the first item up", () => {
    expect(swapProductOrder(products, 0, "up")).toBeNull();
  });

  it("returns null when moving the last item down", () => {
    expect(swapProductOrder(products, products.length - 1, "down")).toBeNull();
  });

  it("does not mutate the input array", () => {
    const original = [...products];
    swapProductOrder(products, 1, "up");
    expect(products).toEqual(original);
  });
});
