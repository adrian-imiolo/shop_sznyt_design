import { describe, it, expect } from "vitest";
import { addToCart, mergeDuplicateItems } from "./cartItems";
import type { CartItem } from "../types";

function frame(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 2,
    name: "Ramka Corner Cut",
    price: 249,
    imageUrl: "/img/corner-cut.jpg",
    quantity: 1,
    stock: 5,
    ...overrides,
  };
}

function product(
  overrides: Partial<Omit<CartItem, "quantity">> = {},
): Omit<CartItem, "quantity"> {
  const item: Partial<CartItem> = frame(overrides);
  delete item.quantity;
  return item as Omit<CartItem, "quantity">;
}

describe("addToCart", () => {
  it("increments quantity of an existing line instead of appending a duplicate", () => {
    const cart = [frame({ quantity: 1 })];

    const result = addToCart(cart, product());

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });

  it("appends a new line with quantity 1 for a product not in the cart", () => {
    const cart = [frame({ id: 1, name: "Ramka Oak" })];

    const result = addToCart(cart, product());

    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(frame({ quantity: 1 }));
  });

  it("does not increment past available stock — returns the input array untouched", () => {
    const cart = [frame({ quantity: 5, stock: 5 })];

    const result = addToCart(cart, product());

    // same reference on no-op is contract: CartProvider uses it to decide
    // whether the add succeeded
    expect(result).toBe(cart);
  });

  it("does not add a product with zero stock — returns the input array untouched", () => {
    const cart: CartItem[] = [];

    const result = addToCart(cart, product({ stock: 0 }));

    expect(result).toBe(cart);
  });
});

describe("mergeDuplicateItems", () => {
  it("collapses duplicate lines of the same product into one, summing quantities", () => {
    const stored = [
      frame({ quantity: 1 }),
      frame({ id: 1, name: "Ramka Oak", quantity: 1 }),
      frame({ quantity: 1 }),
    ];

    const result = mergeDuplicateItems(stored);

    expect(result).toEqual([
      frame({ quantity: 2 }),
      frame({ id: 1, name: "Ramka Oak", quantity: 1 }),
    ]);
  });

  it("caps the merged quantity at available stock", () => {
    const stored = [
      frame({ quantity: 3, stock: 5 }),
      frame({ quantity: 3, stock: 5 }),
    ];

    const result = mergeDuplicateItems(stored);

    expect(result).toEqual([frame({ quantity: 5, stock: 5 })]);
  });
});
