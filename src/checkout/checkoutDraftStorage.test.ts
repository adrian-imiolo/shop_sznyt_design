import { describe, it, expect } from "vitest";
import { parseStoredDraft, serializeStoredDraft } from "./checkoutDraftStorage";
import { validAddress } from "./testFixtures";
import type { StoredCheckoutDraft } from "./checkoutDraftStorage";

const fullDraft: StoredCheckoutDraft = {
  shippingMethod: "paczkomat",
  paczkomatPoint: { code: "KRA01M", name: "Paczkomat KRA01M", city: "Kraków" },
  address: validAddress,
  note: "Proszę zostawić u sąsiada",
};

describe("parseStoredDraft", () => {
  it("round-trips a full draft through serialize", () => {
    expect(parseStoredDraft(serializeStoredDraft(fullDraft))).toEqual(fullDraft);
  });

  it("round-trips a pristine draft (nothing selected yet)", () => {
    const pristine: StoredCheckoutDraft = {
      shippingMethod: null,
      paczkomatPoint: null,
      address: { firstName: "", lastName: "", email: "", street: "", postalCode: "", city: "", phone: "" },
      note: "",
    };
    expect(parseStoredDraft(serializeStoredDraft(pristine))).toEqual(pristine);
  });

  it("returns null for absent storage value", () => {
    expect(parseStoredDraft(null)).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    expect(parseStoredDraft("{not json")).toBeNull();
  });

  it("returns null for non-object payloads", () => {
    expect(parseStoredDraft('"just a string"')).toBeNull();
    expect(parseStoredDraft("[1,2]")).toBeNull();
    expect(parseStoredDraft("null")).toBeNull();
  });

  it("rejects an unknown shipping method", () => {
    const raw = serializeStoredDraft(fullDraft).replace("paczkomat", "pigeon");
    expect(parseStoredDraft(raw)).toBeNull();
  });

  it("rejects a paczkomat point without a code", () => {
    const broken = { ...fullDraft, paczkomatPoint: { name: "Paczkomat" } };
    expect(parseStoredDraft(JSON.stringify(broken))).toBeNull();
  });

  it("rejects an address with a missing field", () => {
    const partialAddress: Record<string, string> = { ...validAddress };
    delete partialAddress.phone;
    const broken = { ...fullDraft, address: partialAddress };
    expect(parseStoredDraft(JSON.stringify(broken))).toBeNull();
  });

  it("rejects an address with a non-string field", () => {
    const broken = { ...fullDraft, address: { ...validAddress, phone: 123456789 } };
    expect(parseStoredDraft(JSON.stringify(broken))).toBeNull();
  });

  it("rejects a non-string note", () => {
    const broken = { ...fullDraft, note: 42 };
    expect(parseStoredDraft(JSON.stringify(broken))).toBeNull();
  });

  it("clamps an over-length note to the shared cap", () => {
    const broken = { ...fullDraft, note: "x".repeat(500) };
    const parsed = parseStoredDraft(JSON.stringify(broken));
    expect(parsed?.note).toHaveLength(300);
  });

  it("rejects the draft when the stored point city is a non-string", () => {
    const broken = { ...fullDraft, paczkomatPoint: { code: "KRA01M", name: "P", city: 7 } };
    expect(parseStoredDraft(JSON.stringify(broken))).toBeNull();
  });

  it("accepts a point without the optional city", () => {
    const draft = { ...fullDraft, paczkomatPoint: { code: "KRA01M", name: "Paczkomat KRA01M" } };
    expect(parseStoredDraft(JSON.stringify(draft))).toEqual(draft);
  });
});
