import { describe, it, expect } from "vitest";
import { formatOrderDate, formatPaczkomatLine, formatRecipientLine } from "./formatting";

describe("formatOrderDate", () => {
  it("renders an ISO timestamp as a Polish date", () => {
    expect(formatOrderDate("2026-07-12T09:30:00.000Z")).toBe("12.07.2026");
  });
});

describe("formatRecipientLine", () => {
  it("joins full recipient data into one comma-separated line", () => {
    expect(
      formatRecipientLine({
        firstName: "Jan",
        lastName: "Kowalski",
        street: "Lipowa 5",
        postalCode: "70-001",
        city: "Szczecin",
        phone: "600100200",
      }),
    ).toBe("Jan Kowalski, Lipowa 5, 70-001 Szczecin, 600100200");
  });

  it("falls back to the bare city when the postal code is missing", () => {
    expect(formatRecipientLine({ city: "Szczecin" })).toBe("Szczecin");
  });

  it("omits the name unless both first and last name are present", () => {
    expect(formatRecipientLine({ firstName: "Jan", street: "Lipowa 5" })).toBe("Lipowa 5");
  });

  it("returns an empty string for an empty address", () => {
    expect(formatRecipientLine({})).toBe("");
  });
});

describe("formatPaczkomatLine", () => {
  it("shows the point code with its city", () => {
    expect(formatPaczkomatLine({ code: "KRA010", city: "Kraków" })).toBe(
      "Paczkomat: KRA010, Kraków",
    );
  });

  it("omits the city when absent", () => {
    expect(formatPaczkomatLine({ code: "KRA010" })).toBe("Paczkomat: KRA010");
  });
});
