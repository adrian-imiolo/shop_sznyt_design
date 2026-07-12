import { describe, it, expect } from "vitest";
import { buildShippingAddress } from "./buildShippingAddress";
import { validAddress as address, paczkomatPoint as point } from "./testFixtures";

describe("buildShippingAddress", () => {
  it("courier: carries the seven contact fields and no code/name", () => {
    const result = buildShippingAddress("dpd", address, null);
    expect(result).toEqual({
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@example.com",
      street: "Prosta 1",
      postalCode: "70-123",
      city: "Szczecin",
      phone: "501234567",
    });
    expect("code" in result).toBe(false);
    expect("name" in result).toBe(false);
  });

  it("paczkomat: adds the point's code and name to the seven fields", () => {
    const result = buildShippingAddress("paczkomat", address, point);
    expect(result.code).toBe("KRA010");
    expect(result.name).toBe("Wielicka 28");
    expect(result.email).toBe("jan@example.com");
  });

  it("paczkomat: keeps the customer's own city, dropping the point's", () => {
    const result = buildShippingAddress("paczkomat", address, point);
    expect(result.city).toBe("Szczecin");
  });

  it("paczkomat without a point is a contract violation", () => {
    expect(() => buildShippingAddress("paczkomat", address, null)).toThrow();
  });
});
