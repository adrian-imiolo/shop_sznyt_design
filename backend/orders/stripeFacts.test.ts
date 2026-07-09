import { describe, it, expect } from "vitest";
import type Stripe from "stripe";
import { paidOrderFactsFromSession } from "./stripeFacts.ts";

function fakeSession(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    amount_total: 16999, // grosze
    customer_details: { email: "klient@example.com" },
    metadata: {
      userId: "user_abc",
      shippingMethod: "paczkomat",
      shippingAddress: JSON.stringify({ firstName: "Jan", city: "Kraków" }),
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

function productLine(productId: number, unitAmount: number, name: string): Stripe.LineItem {
  return {
    description: name,
    quantity: 2,
    price: {
      unit_amount: unitAmount,
      product: { name, metadata: { productId: String(productId) } },
    },
  } as unknown as Stripe.LineItem;
}

const SHIPPING_LINE = {
  description: "Dostawa — InPost Paczkomat",
  quantity: 1,
  price: {
    unit_amount: 2000,
    product: { name: "Dostawa — InPost Paczkomat", metadata: {} },
  },
} as unknown as Stripe.LineItem;

describe("paidOrderFactsFromSession", () => {
  it("normalizes session fields into PLN and parses the shipping address", () => {
    const facts = paidOrderFactsFromSession(fakeSession(), [], "blik");

    expect(facts.stripeSessionId).toBe("cs_test_123");
    expect(facts.total).toBe(169.99);
    expect(facts.customerEmail).toBe("klient@example.com");
    expect(facts.userId).toBe("user_abc");
    expect(facts.shippingMethod).toBe("paczkomat");
    expect(facts.shippingAddress).toEqual({ firstName: "Jan", city: "Kraków" });
    expect(facts.paymentMethod).toBe("blik");
  });

  it("handles guest sessions with no metadata gracefully", () => {
    const facts = paidOrderFactsFromSession(
      fakeSession({ metadata: {}, customer_details: null }),
      [],
      null,
    );
    expect(facts.customerEmail).toBeNull();
    expect(facts.userId).toBeNull();
    expect(facts.shippingMethod).toBeNull();
    expect(facts.shippingAddress).toBeNull();
  });

  it("reads productId from metadata for product lines (line-item contract)", () => {
    const facts = paidOrderFactsFromSession(
      fakeSession(),
      [productLine(7, 14999, "Rama Dębowa 30×40")],
      null,
    );
    expect(facts.lineItems).toEqual([
      { productId: 7, name: "Rama Dębowa 30×40", quantity: 2, unitPrice: 149.99 },
    ]);
  });

  it("gives the shipping line productId null so intake skips it", () => {
    const facts = paidOrderFactsFromSession(fakeSession(), [SHIPPING_LINE], null);
    expect(facts.lineItems).toEqual([
      {
        productId: null,
        name: "Dostawa — InPost Paczkomat",
        quantity: 1,
        unitPrice: 20,
      },
    ]);
  });

  it("falls back to the product name when description is missing", () => {
    const line = productLine(7, 14999, "Rama Dębowa 30×40");
    (line as { description: string | null }).description = null;
    const facts = paidOrderFactsFromSession(fakeSession(), [line], null);
    expect(facts.lineItems[0].name).toBe("Rama Dębowa 30×40");
  });
});
