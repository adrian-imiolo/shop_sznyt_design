import { describe, it, expect } from "vitest";
import { validateCheckoutDraft } from "./validateCheckoutDraft";
import { validAddress } from "./testFixtures";
import type { CheckoutDraft, CourierAddress } from "./types";
import type { CartItem } from "../types";

const items: CartItem[] = [
  { id: 1, name: "Rama A", price: 200, imageUrl: "/a.jpg", quantity: 1, stock: 5 },
];

const emptyAddress: CourierAddress = {
  firstName: "", lastName: "", email: "", street: "", postalCode: "", city: "", phone: "",
};

function draft(overrides: Partial<CheckoutDraft>): CheckoutDraft {
  return {
    items,
    shippingMethod: "dpd",
    paczkomatPoint: null,
    address: validAddress,
    ...overrides,
  };
}

describe("validateCheckoutDraft — completeness (missing)", () => {
  it("passes a complete courier draft", () => {
    const result = validateCheckoutDraft(draft({}));
    expect(result.missing).toEqual([]);
  });

  it("requires a shipping method", () => {
    const result = validateCheckoutDraft(draft({ shippingMethod: null }));
    expect(result.missing).toContain("shippingMethod");
  });

  it("requires a point iff paczkomat", () => {
    const paczkomat = validateCheckoutDraft(draft({ shippingMethod: "paczkomat" }));
    expect(paczkomat.missing).toContain("paczkomatPoint");

    const withPoint = validateCheckoutDraft(
      draft({
        shippingMethod: "paczkomat",
        paczkomatPoint: { code: "KRA010", name: "Prosta 2", city: "Kraków" },
      }),
    );
    expect(withPoint.missing).toEqual([]);

    const courier = validateCheckoutDraft(draft({ shippingMethod: "inpost_kurier" }));
    expect(courier.missing).not.toContain("paczkomatPoint");
  });

  it("lists every empty address field", () => {
    const result = validateCheckoutDraft(draft({ address: emptyAddress }));
    expect(result.missing).toEqual(
      expect.arrayContaining(["firstName", "lastName", "email", "street", "postalCode", "city", "phone"]),
    );
  });

  it("treats whitespace-only fields as empty", () => {
    const result = validateCheckoutDraft(draft({ address: { ...validAddress, city: "   " } }));
    expect(result.missing).toContain("city");
  });
});

describe("validateCheckoutDraft — format (fieldErrors)", () => {
  it("accepts a fully valid address", () => {
    expect(validateCheckoutDraft(draft({})).fieldErrors).toEqual({});
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

  it("reports multiple format errors at once", () => {
    const { fieldErrors } = validateCheckoutDraft(
      draft({ address: { ...validAddress, email: "x", postalCode: "1", phone: "2" } }),
    );
    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "phone", "postalCode"]);
  });
});

describe("validateCheckoutDraft — the two views are independent", () => {
  it("filled-but-invalid: completeness passes while format fails", () => {
    const result = validateCheckoutDraft(
      draft({ address: { ...validAddress, email: "not-an-email", postalCode: "12345" } }),
    );
    expect(result.missing).toEqual([]);
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "postalCode"]);
  });
});
