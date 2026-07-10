import { describe, it, expect } from "vitest";
import { validateCheckoutDraft } from "./validateCheckoutDraft";
import { VALID_ADDRESS as validAddress, PACZKOMAT_POINT as point } from "./fixtures.test-helper";
import type { CheckoutDraft } from "./types";

function draft(overrides: Partial<CheckoutDraft> = {}): CheckoutDraft {
  return { shippingMethod: "dpd", paczkomatPoint: null, address: validAddress, ...overrides };
}

describe("validateCheckoutDraft — completeness (drives the button)", () => {
  it("is complete for a courier draft with all fields filled", () => {
    expect(validateCheckoutDraft(draft()).missing).toEqual([]);
  });

  it("requires a shipping method", () => {
    expect(validateCheckoutDraft(draft({ shippingMethod: null })).missing).toContain("shippingMethod");
  });

  it("requires a paczkomat point iff the method is paczkomat", () => {
    expect(validateCheckoutDraft(draft({ shippingMethod: "paczkomat" })).missing).toContain("paczkomatPoint");
    expect(
      validateCheckoutDraft(draft({ shippingMethod: "paczkomat", paczkomatPoint: point })).missing,
    ).toEqual([]);
    expect(validateCheckoutDraft(draft({ shippingMethod: "inpost_kurier" })).missing).toEqual([]);
  });

  it("reports every empty address field, ignoring whitespace-only values", () => {
    const { missing } = validateCheckoutDraft(
      draft({ address: { ...validAddress, firstName: "  ", city: "" } }),
    );
    expect(missing).toContain("firstName");
    expect(missing).toContain("city");
    expect(missing).not.toContain("lastName");
  });
});

describe("validateCheckoutDraft — format (drives the submit guard)", () => {
  it("accepts a fully valid address", () => {
    expect(validateCheckoutDraft(draft()).fieldErrors).toEqual({});
  });

  it("rejects a malformed email", () => {
    expect(
      validateCheckoutDraft(draft({ address: { ...validAddress, email: "jan@" } })).fieldErrors,
    ).toHaveProperty("email");
    expect(
      validateCheckoutDraft(draft({ address: { ...validAddress, email: "jan kowalski@example.com" } }))
        .fieldErrors,
    ).toHaveProperty("email");
  });

  it("rejects postal codes not matching XX-XXX", () => {
    for (const postalCode of ["70123", "701-23", ""]) {
      expect(
        validateCheckoutDraft(draft({ address: { ...validAddress, postalCode } })).fieldErrors,
      ).toHaveProperty("postalCode");
    }
  });

  it("accepts 9-digit phones with separators and +48 prefix", () => {
    for (const phone of ["501 234 567", "501-234-567", "+48501234567"]) {
      expect(
        validateCheckoutDraft(draft({ address: { ...validAddress, phone } })).fieldErrors,
      ).toEqual({});
    }
  });

  it("rejects phones with the wrong digit count", () => {
    for (const phone of ["12345678", "1234567890"]) {
      expect(
        validateCheckoutDraft(draft({ address: { ...validAddress, phone } })).fieldErrors,
      ).toHaveProperty("phone");
    }
  });

  it("reports multiple errors at once", () => {
    const { fieldErrors } = validateCheckoutDraft(
      draft({ address: { ...validAddress, email: "x", postalCode: "1", phone: "2" } }),
    );
    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "phone", "postalCode"]);
  });
});

describe("validateCheckoutDraft — the two views are independent", () => {
  it("a filled-but-malformed draft is complete (button enables) yet fails format (submit blocks)", () => {
    const result = validateCheckoutDraft(draft({ address: { ...validAddress, email: "not-an-email" } }));
    expect(result.missing).toEqual([]);
    expect(result.fieldErrors).toHaveProperty("email");
  });
});
