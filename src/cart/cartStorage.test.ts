import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { parseStoredCart, loadCart, saveCart } from "./cartStorage";
import type { CartItem } from "../types";

/** Minimal in-memory Storage — the root suite runs without a DOM. */
function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

const items: CartItem[] = [
  { id: 1, name: "Rama Dąb 30x40", price: 249, imageUrl: "/img/dab.jpg", quantity: 2, stock: 5 },
  { id: 2, name: "Rama Orzech 50x70", price: 399, imageUrl: "/img/orzech.jpg", quantity: 1, stock: 3 },
];

describe("parseStoredCart", () => {
  it("round-trips a stored cart", () => {
    expect(parseStoredCart(JSON.stringify(items))).toEqual(items);
  });

  it("merges duplicate lines from carts saved before #70", () => {
    const duplicated = [items[0], { ...items[0], quantity: 1 }];
    expect(parseStoredCart(JSON.stringify(duplicated))).toEqual([
      { ...items[0], quantity: 3 },
    ]);
  });

  it("returns an empty cart for absent storage value", () => {
    expect(parseStoredCart(null)).toEqual([]);
  });

  it("returns an empty cart for corrupt JSON", () => {
    expect(parseStoredCart("{not json")).toEqual([]);
  });

  it("returns an empty cart for non-array payloads", () => {
    expect(parseStoredCart('{"id":1}')).toEqual([]);
    expect(parseStoredCart('"just a string"')).toEqual([]);
  });
});

describe("loadCart / saveCart", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists unconditionally — no consent interaction required", () => {
    saveCart(items);
    expect(loadCart()).toEqual(items);
  });

  it("persists despite a stale declined cookie_consent entry", () => {
    vi.stubGlobal(
      "localStorage",
      fakeStorage({ cookie_consent: "declined" }),
    );
    saveCart(items);
    expect(loadCart()).toEqual(items);
  });

  it("loads a cart written before the consent mechanism was removed", () => {
    vi.stubGlobal(
      "localStorage",
      fakeStorage({ cookie_consent: "accepted", cart: JSON.stringify(items) }),
    );
    expect(loadCart()).toEqual(items);
  });

  it("returns an empty cart when storage is unavailable", () => {
    vi.unstubAllGlobals();
    expect(loadCart()).toEqual([]);
  });

  it("swallows save failures when storage is unavailable", () => {
    vi.unstubAllGlobals();
    expect(() => saveCart(items)).not.toThrow();
  });
});
