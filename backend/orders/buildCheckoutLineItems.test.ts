import { describe, it, expect } from "vitest";
import { buildCheckoutLineItems } from "./buildCheckoutLineItems.ts";
import type { CheckoutProduct } from "./types.ts";

const FRAME: CheckoutProduct = {
  id: 7,
  name: "Rama Dębowa 30×40",
  price: 149.99,
  stock: 5,
  imageUrl: "https://example.com/rama.jpg",
};

const SMALL_FRAME: CheckoutProduct = {
  id: 8,
  name: "Rama Jesionowa 21×30",
  price: 89,
  stock: 2,
  imageUrl: null,
};

describe("buildCheckoutLineItems", () => {
  it("rejects a missing or unknown shipping method with 400", () => {
    for (const method of [undefined, null, "", "drone"]) {
      const result = buildCheckoutLineItems([{ id: 7, quantity: 1 }], [FRAME], method);
      expect(result).toEqual({ ok: false, status: 400, error: "Wybierz metodę dostawy" });
    }
  });

  it("rejects an empty or non-array cart with 400", () => {
    for (const items of [[], null, undefined, "nope"]) {
      const result = buildCheckoutLineItems(items, [FRAME], "paczkomat");
      expect(result).toEqual({ ok: false, status: 400, error: "Koszyk jest pusty" });
    }
  });

  it("rejects unknown products and invalid quantities with 400", () => {
    const cases = [
      [{ id: 999, quantity: 1 }], // not in DB
      [{ id: 7, quantity: 0 }],
      [{ id: 7, quantity: -1 }],
      [{ id: 7, quantity: 1.5 }],
      [{ id: 7, quantity: "abc" }],
    ];
    for (const items of cases) {
      const result = buildCheckoutLineItems(items, [FRAME], "paczkomat");
      expect(result).toEqual({
        ok: false,
        status: 400,
        error: "Nieprawidłowy produkt w koszyku",
      });
    }
  });

  it("rejects a quantity above stock with 409 and names the product", () => {
    const result = buildCheckoutLineItems([{ id: 8, quantity: 3 }], [SMALL_FRAME], "dpd");
    expect(result).toEqual({
      ok: false,
      status: 409,
      error: `Niewystarczająca ilość produktu „Rama Jesionowa 21×30" — dostępne sztuki: 2`,
    });
  });

  it("prices from the DB, stamps metadata.productId, and appends the shipping line", () => {
    const result = buildCheckoutLineItems(
      [{ id: 7, quantity: 1 }, { id: 8, quantity: 1 }],
      [FRAME, SMALL_FRAME],
      "paczkomat",
    );
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);

    expect(result.subtotal).toBeCloseTo(238.99);
    expect(result.shippingCost).toBe(20);
    expect(result.lineItems).toHaveLength(3);

    const [frame, smallFrame, shipping] = result.lineItems;
    expect(frame.price_data?.product_data?.metadata).toEqual({ productId: "7" });
    expect(frame.price_data?.unit_amount).toBe(14999); // grosze, rounded
    expect(frame.price_data?.product_data?.images).toEqual(["https://example.com/rama.jpg"]);
    expect(smallFrame.price_data?.product_data?.images).toBeUndefined();

    // The line-item contract: the shipping line has no productId, so order
    // intake will skip it for OrderItems and stock decrement.
    expect(shipping.price_data?.product_data?.name).toBe("Dostawa — InPost Paczkomat");
    expect(shipping.price_data?.product_data?.metadata).toEqual({});
    expect(shipping.price_data?.unit_amount).toBe(2000);
    expect(shipping.quantity).toBe(1);
  });

  it("drops the shipping line at or above the free-shipping threshold", () => {
    const result = buildCheckoutLineItems([{ id: 7, quantity: 3 }], [FRAME], "dpd");
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);

    expect(result.subtotal).toBeCloseTo(449.97);
    expect(result.shippingCost).toBe(0);
    expect(result.lineItems).toHaveLength(1);
  });

  it("charges shipping just below the threshold", () => {
    const cheap: CheckoutProduct = { ...SMALL_FRAME, price: 349.99, stock: 1 };
    const result = buildCheckoutLineItems([{ id: 8, quantity: 1 }], [cheap], "inpost_kurier");
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.shippingCost).toBe(25);
  });
});
