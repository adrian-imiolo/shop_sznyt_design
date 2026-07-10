import { describe, it, expect } from "vitest";
import { buildShippingAddress } from "./buildShippingAddress";
import { VALID_ADDRESS as address, PACZKOMAT_POINT as point } from "./fixtures.test-helper";

describe("buildShippingAddress", () => {
  it("courier variant carries exactly the seven contact fields", () => {
    expect(buildShippingAddress("dpd", address, null)).toEqual({
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@example.com",
      street: "Prosta 1",
      postalCode: "70-123",
      city: "Szczecin",
      phone: "501234567",
    });
  });

  it("paczkomat variant adds the point's code and name", () => {
    const built = buildShippingAddress("paczkomat", address, point);
    expect(built.code).toBe("SZC01M");
    expect(built.name).toBe("ul. Paczkowa 5");
  });

  it("paczkomat variant keeps the customer's own city — the point's city is dropped", () => {
    const built = buildShippingAddress("paczkomat", address, point);
    expect(built.city).toBe("Szczecin");
  });

  it("courier variant carries no paczkomat fields even when a stale point lingers", () => {
    const built = buildShippingAddress("inpost_kurier", address, point);
    expect(built).not.toHaveProperty("code");
    expect(built).not.toHaveProperty("name");
  });
});
