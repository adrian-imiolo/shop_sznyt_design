import { describe, it, expect } from "vitest";
import { buildCheckoutLineItems } from "./buildCheckoutLineItems.ts";
import type { CheckoutProduct } from "./types.ts";

const FRAME: CheckoutProduct = {
  id: 7,
  name: "Rama Dębowa 30×40",
  price: 149.99,
  stock: 5,
  imageUrl: "/images/rama.jpg",
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
      "https://sznyt-design.vercel.app",
    );
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);

    expect(result.subtotal).toBeCloseTo(238.99);
    expect(result.shippingCost).toBe(20);
    expect(result.lineItems).toHaveLength(3);

    const [frame, smallFrame, shipping] = result.lineItems;
    expect(frame.price_data?.product_data?.metadata).toEqual({ productId: "7" });
    expect(frame.price_data?.unit_amount).toBe(14999); // grosze, rounded
    expect(frame.price_data?.product_data?.images).toEqual([
      "https://sznyt-design.vercel.app/images/rama.jpg",
    ]);
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

  it("passes an already-absolute imageUrl to Stripe unchanged", () => {
    const absolute: CheckoutProduct = {
      ...FRAME,
      imageUrl: "https://placehold.co/800x1000?text=Studio",
    };
    const result = buildCheckoutLineItems(
      [{ id: 7, quantity: 1 }],
      [absolute],
      "dpd",
      "https://sznyt-design.vercel.app",
    );
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.lineItems[0].price_data?.product_data?.images).toEqual([
      "https://placehold.co/800x1000?text=Studio",
    ]);
  });

  it("prefixes without doubling the slash when frontendUrl has a trailing slash", () => {
    const result = buildCheckoutLineItems(
      [{ id: 7, quantity: 1 }],
      [FRAME],
      "dpd",
      "https://sznyt-design.vercel.app/",
    );
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.lineItems[0].price_data?.product_data?.images).toEqual([
      "https://sznyt-design.vercel.app/images/rama.jpg",
    ]);
  });

  it("omits the image when the url is relative and no frontendUrl is given", () => {
    // Stripe rejects non-absolute image URLs — better no thumbnail than a failed session
    const result = buildCheckoutLineItems([{ id: 7, quantity: 1 }], [FRAME], "dpd");
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.lineItems[0].price_data?.product_data?.images).toBeUndefined();
  });

  it("charges shipping just below the threshold", () => {
    const cheap: CheckoutProduct = { ...SMALL_FRAME, price: 349.99, stock: 1 };
    const result = buildCheckoutLineItems([{ id: 8, quantity: 1 }], [cheap], "inpost_kurier");
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.shippingCost).toBe(25);
  });
});
