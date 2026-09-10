import { describe, it, expect } from "vitest";
import { validateProductForm } from "./productFormValidation";

const values = {
  name: "Rama Dębowa 30×40",
  tagline: "Ciepły dąb",
  description: "Ręcznie robiona rama z litego dębu.",
  price: "149,99",
  imageUrl: "/img/studio.webp",
  lifestyleImageUrl: "/img/lifestyle.webp",
  stock: "5",
};

describe("validateProductForm", () => {
  it("accepts a Polish comma decimal separator in price", () => {
    const result = validateProductForm(values);

    expect(result).toEqual({
      ok: true,
      payload: { ...values, price: 149.99, stock: 5 },
    });
  });

  it("rejects a price that isn't a number", () => {
    const result = validateProductForm({ ...values, price: "sto złotych" });

    expect(result).toEqual({
      ok: false,
      fieldErrors: { price: "Podaj cenę jako liczbę, np. 149,99" },
    });
  });

  it("rejects a price that isn't above zero", () => {
    const zero = validateProductForm({ ...values, price: "0" });
    const negative = validateProductForm({ ...values, price: "-10" });

    const expected = { ok: false, fieldErrors: { price: "Cena musi być większa od zera" } };
    expect(zero).toEqual(expected);
    expect(negative).toEqual(expected);
  });

  it("requires stock to be a whole number, zero or more", () => {
    const fractional = validateProductForm({ ...values, stock: "2,5" });
    const negative = validateProductForm({ ...values, stock: "-1" });

    const expected = {
      ok: false,
      fieldErrors: { stock: "Podaj ilość jako liczbę całkowitą, zero lub więcej" },
    };
    expect(fractional).toEqual(expected);
    expect(negative).toEqual(expected);
  });

  it("reports every bad field at once, not just the first", () => {
    const result = validateProductForm({ ...values, price: "abc", stock: "-1" });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        price: "Podaj cenę jako liczbę, np. 149,99",
        stock: "Podaj ilość jako liczbę całkowitą, zero lub więcej",
      },
    });
  });

  it("accepts zero stock — a sold-out frame stays listed", () => {
    const result = validateProductForm({ ...values, stock: "0" });

    expect(result).toEqual({
      ok: true,
      payload: { ...values, price: 149.99, stock: 0 },
    });
  });
});
