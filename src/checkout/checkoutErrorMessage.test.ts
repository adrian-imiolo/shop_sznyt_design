import { describe, it, expect } from "vitest";
import { ApiError } from "../lib/api";
import { checkoutErrorMessage, CHECKOUT_ERROR_FALLBACK } from "./checkoutErrorMessage";

describe("checkoutErrorMessage", () => {
  it("passes through server-provided messages (e.g. the 409 stock error)", () => {
    const err = new ApiError("Brak wystarczającej ilości produktu w magazynie", 409);
    expect(checkoutErrorMessage(err)).toBe("Brak wystarczającej ilości produktu w magazynie");
  });

  it("hides the browser's raw TypeError when the backend is unreachable (#62)", () => {
    expect(checkoutErrorMessage(new TypeError("Failed to fetch"))).toBe(CHECKOUT_ERROR_FALLBACK);
  });

  it("falls back for plain Errors — only ApiError means the server spoke", () => {
    expect(checkoutErrorMessage(new Error("anything"))).toBe(CHECKOUT_ERROR_FALLBACK);
  });

  it("falls back for an ApiError with an empty message", () => {
    expect(checkoutErrorMessage(new ApiError("", 500))).toBe(CHECKOUT_ERROR_FALLBACK);
  });

  it("falls back for non-Error throws", () => {
    expect(checkoutErrorMessage("string")).toBe(CHECKOUT_ERROR_FALLBACK);
    expect(checkoutErrorMessage(undefined)).toBe(CHECKOUT_ERROR_FALLBACK);
  });
});
