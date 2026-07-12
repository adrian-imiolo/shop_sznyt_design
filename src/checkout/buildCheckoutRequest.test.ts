import { describe, it, expect } from "vitest";
import { buildCheckoutRequest } from "./buildCheckoutRequest";
import type { CheckoutDraft } from "./types";

const draft: CheckoutDraft = {
  items: [
    { id: 3, name: "Rama A", price: 200, imageUrl: "/a.jpg", quantity: 2, stock: 5 },
    { id: 7, name: "Rama B", price: 150, imageUrl: "/b.jpg", quantity: 1, stock: 2 },
  ],
  shippingMethod: "paczkomat",
  paczkomatPoint: { code: "KRA010", name: "Wielicka 28", city: "Kraków" },
  address: {
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan@example.com",
    street: "Prosta 1",
    postalCode: "70-123",
    city: "Szczecin",
    phone: "501234567",
  },
};

describe("buildCheckoutRequest", () => {
  it("sends only id+quantity per item — the backend prices from the DB", () => {
    const body = buildCheckoutRequest(draft, "user_123", "");
    expect(body.items).toEqual([
      { id: 3, quantity: 2 },
      { id: 7, quantity: 1 },
    ]);
  });

  it("carries userId, shippingMethod and the built shippingAddress", () => {
    const body = buildCheckoutRequest(draft, "user_123", "");
    expect(body.userId).toBe("user_123");
    expect(body.shippingMethod).toBe("paczkomat");
    expect(body.shippingAddress.code).toBe("KRA010");
    expect(body.shippingAddress.city).toBe("Szczecin");
  });

  it("guest checkout: userId passes through as null", () => {
    expect(buildCheckoutRequest(draft, null, "").userId).toBeNull();
  });

  it("includes the trimmed note only when non-empty", () => {
    expect(buildCheckoutRequest(draft, null, "  kod bramy 1234  ").note).toBe("kod bramy 1234");
    expect("note" in buildCheckoutRequest(draft, null, "   ")).toBe(false);
    expect("note" in buildCheckoutRequest(draft, null, "")).toBe(false);
  });
});
