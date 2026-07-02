import { describe, it, expect } from "vitest";
import { validateAddress } from "./checkout-validation";
import type { CourierAddress } from "../types";

const validAddress: CourierAddress = {
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  street: "Prosta 1",
  postalCode: "70-123",
  city: "Szczecin",
  phone: "501234567",
};

describe("validateAddress", () => {
  it("accepts a fully valid address", () => {
    expect(validateAddress(validAddress)).toEqual({});
  });

  it("rejects a malformed email", () => {
    expect(validateAddress({ ...validAddress, email: "jan@" })).toHaveProperty("email");
    expect(validateAddress({ ...validAddress, email: "jan kowalski@example.com" })).toHaveProperty("email");
  });

  it("rejects postal codes not matching XX-XXX", () => {
    expect(validateAddress({ ...validAddress, postalCode: "70123" })).toHaveProperty("postalCode");
    expect(validateAddress({ ...validAddress, postalCode: "701-23" })).toHaveProperty("postalCode");
    expect(validateAddress({ ...validAddress, postalCode: "" })).toHaveProperty("postalCode");
  });

  it("accepts 9-digit phones with separators and +48 prefix", () => {
    expect(validateAddress({ ...validAddress, phone: "501 234 567" })).toEqual({});
    expect(validateAddress({ ...validAddress, phone: "501-234-567" })).toEqual({});
    expect(validateAddress({ ...validAddress, phone: "+48501234567" })).toEqual({});
  });

  it("rejects phones with the wrong digit count", () => {
    expect(validateAddress({ ...validAddress, phone: "12345678" })).toHaveProperty("phone");
    expect(validateAddress({ ...validAddress, phone: "1234567890" })).toHaveProperty("phone");
  });

  it("reports multiple errors at once", () => {
    const errors = validateAddress({ ...validAddress, email: "x", postalCode: "1", phone: "2" });
    expect(Object.keys(errors).sort()).toEqual(["email", "phone", "postalCode"]);
  });
});
