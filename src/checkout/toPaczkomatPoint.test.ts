import { describe, it, expect } from "vitest";
import { toPaczkomatPoint } from "./toPaczkomatPoint";

describe("toPaczkomatPoint", () => {
  it("builds name as 'street, city' so cart and emails carry the full point address", () => {
    const result = toPaczkomatPoint({
      name: "KRA010",
      address: { line1: "Wielicka 28", city: "Kraków" },
    });
    expect(result).toEqual({
      code: "KRA010",
      name: "Wielicka 28, Kraków",
      city: "Kraków",
    });
  });

  it("falls back to street alone when the widget omits the city", () => {
    const result = toPaczkomatPoint({
      name: "SZC105M",
      address: { line1: "Sucharskiego 12" },
    });
    expect(result.name).toBe("Sucharskiego 12");
  });

  it("falls back to the code when the widget omits the street", () => {
    const result = toPaczkomatPoint({ name: "SZC105M", address: { city: "Szczecin" } });
    expect(result.name).toBe("SZC105M");
  });

  it("falls back to the code when the widget sends no address at all", () => {
    const result = toPaczkomatPoint({ name: "SZC105M" });
    expect(result).toEqual({ code: "SZC105M", name: "SZC105M", city: undefined });
  });
});
