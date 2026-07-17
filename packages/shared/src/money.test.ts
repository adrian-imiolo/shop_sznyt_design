import { describe, expect, it } from "vitest";
import { formatPln } from "./money.ts";

// NBSP (U+00A0): the amount must never wrap away from "PLN", and thousands
// groups must never split across lines. Kept as an escape because a literal
// NBSP is indistinguishable from a space in an editor.
const NBSP = "\u00A0";

describe("formatPln", () => {
  it("renders whole amounts without a decimal part", () => {
    expect(formatPln(149)).toBe(`149${NBSP}PLN`);
  });

  it("renders fractional amounts with exactly two decimals, comma-separated", () => {
    expect(formatPln(24.5)).toBe(`24,50${NBSP}PLN`);
    expect(formatPln(19.99)).toBe(`19,99${NBSP}PLN`);
  });

  it("renders zero as a whole amount", () => {
    expect(formatPln(0)).toBe(`0${NBSP}PLN`);
  });

  it("groups thousands with non-breaking spaces", () => {
    expect(formatPln(10813.5)).toBe(`10${NBSP}813,50${NBSP}PLN`);
    expect(formatPln(1234567)).toBe(`1${NBSP}234${NBSP}567${NBSP}PLN`);
  });

  it("normalizes float noise to grosz precision", () => {
    expect(formatPln(0.1 + 0.2)).toBe(`0,30${NBSP}PLN`);
    expect(formatPln(213.99999999999997)).toBe(`214${NBSP}PLN`);
  });
});
