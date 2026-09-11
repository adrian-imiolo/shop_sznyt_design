import { describe, it, expect } from "vitest";
import { addItemToState, addToCart, mergeDuplicateItems } from "./cartItems";
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

    // same reference on no-op is contract: addItemToState reads it to decide
    // whether the add succeeded, and React reads it to skip the re-render
    expect(result).toBe(cart);
  });

  it("does not add a product with zero stock — returns the input array untouched", () => {
    const cart: CartItem[] = [];

    const result = addToCart(cart, product({ stock: 0 }));

    expect(result).toBe(cart);
  });
});

describe("addItemToState", () => {
  it("advances the cart and bumps the token when the add succeeds", () => {
    const prev = { items: [], lastAdd: 0 };

    const result = addItemToState(prev, product());

    expect(result.items).toEqual([frame({ quantity: 1 })]);
    expect(result.lastAdd).toBe(1);
  });

  it("returns the previous state untouched when the add is a no-op", () => {
    const prev = { items: [frame({ quantity: 5, stock: 5 })], lastAdd: 7 };

    const result = addItemToState(prev, product());

    // identical reference, so React bails out of the re-render entirely
    expect(result).toBe(prev);
  });

  // The #167 signal bug. The shipped CartProvider answered "did this add
  // succeed?" with addToCart(items, ...) !== items, computed against the render
  // closure rather than the pending state. Two clicks landing in one render —
  // the case #70's stock guard exists for — both read the same stale closure,
  // so the second add reported success and the toast claimed "Dodano do
  // koszyka!" while the cart had not changed. Folding the token into the state
  // makes each add see its predecessor's result.
  it("does not bump the token for a second add that the stock guard rejects", () => {
    const empty = { items: [] as CartItem[], lastAdd: 0 };

    const afterFirst = addItemToState(empty, product({ stock: 1 }));
    const afterSecond = addItemToState(afterFirst, product({ stock: 1 }));

    expect(afterFirst.lastAdd).toBe(1);
    expect(afterSecond.lastAdd).toBe(1);
    expect(afterSecond.items).toEqual([frame({ quantity: 1, stock: 1 })]);
  });

  it("bumps the token once per add while stock remains", () => {
    const start = { items: [] as CartItem[], lastAdd: 0 };

    const end = [1, 2, 3].reduce((state) => addItemToState(state, product()), start);

    expect(end.lastAdd).toBe(3);
    expect(end.items[0].quantity).toBe(3);
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
