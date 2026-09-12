import { describe, it, expect } from "vitest";
import { addToCartLabel, availabilityLabel, canAddToCart, isSoldOut } from "./availability";

describe("isSoldOut", () => {
  it("holds when no product in the catalog has stock", () => {
    expect(isSoldOut([{ stock: 0 }, { stock: 0 }])).toBe(true);
  });

  it("ends the moment any product has stock — the on-request purchase path", () => {
    expect(isSoldOut([{ stock: 0 }, { stock: 1 }])).toBe(false);
  });

  it("does not hold for an empty catalog, which has nothing to have sold", () => {
    expect(isSoldOut([])).toBe(false);
  });

  it("treats negative stock as none", () => {
    expect(isSoldOut([{ stock: -1 }])).toBe(true);
  });
});

describe("availabilityLabel", () => {
  it("counts units while there is stock", () => {
    expect(availabilityLabel(3)).toBe("3 szt.");
  });

  it("says Wyprzedane at stock 0", () => {
    expect(availabilityLabel(0)).toBe("Wyprzedane");
  });
});

describe("addToCartLabel", () => {
  it("says Wyprzedane for a product with no stock, whatever the cart holds", () => {
    expect(addToCartLabel(0, 0)).toBe("Wyprzedane");
  });

  it("says the cart is full once it holds the whole stock", () => {
    expect(addToCartLabel(2, 2)).toBe("Maksymalna ilość w koszyku");
  });

  it("invites the add while stock remains", () => {
    expect(addToCartLabel(2, 1)).toBe("Dodaj do koszyka");
  });
});

describe("canAddToCart", () => {
  it("is false at stock 0", () => {
    expect(canAddToCart(0, 0)).toBe(false);
  });

  it("is false once the cart holds the whole stock", () => {
    expect(canAddToCart(2, 2)).toBe(false);
  });

  it("is true while stock remains", () => {
    expect(canAddToCart(2, 1)).toBe(true);
  });
});
