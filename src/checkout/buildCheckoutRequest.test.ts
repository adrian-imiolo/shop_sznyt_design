import { describe, it, expect } from "vitest";
import { buildCheckoutRequest } from "./buildCheckoutRequest";
import type { CourierAddress } from "./types";

const address: CourierAddress = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  street: "Prosta 1",
  postalCode: "70-123",
  city: "Szczecin",
  phone: "501234567",
};

describe("buildCheckoutRequest", () => {
  it("strips cart items down to ids and quantities — the backend prices from the DB", () => {
    const body = buildCheckoutRequest(
      [
        { id: 1, quantity: 2, price: 149, name: "Rama", imageUrl: "", stock: 5 },
        { id: 2, quantity: 1, price: 89, name: "Rama 2", imageUrl: "", stock: 3 },
      ],
      "user_123",
      { shippingMethod: "dpd", paczkomatPoint: null, address },
    );
    expect(body.items).toEqual([
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ]);
    expect(body.userId).toBe("user_123");
    expect(body.shippingMethod).toBe("dpd");
    expect(body.shippingAddress.city).toBe("Szczecin");
  });

  it("carries the paczkomat point through the shipping address contract", () => {
    const body = buildCheckoutRequest([], null, {
      shippingMethod: "paczkomat",
      paczkomatPoint: { code: "SZC01M", name: "ul. Paczkowa 5" },
      address,
    });
    expect(body.shippingAddress.code).toBe("SZC01M");
  });
});
