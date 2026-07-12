import { describe, it, expect, vi } from "vitest";
import { submitPublicForm } from "./usePublicForm";
import { ApiError } from "../lib/api";

const FALLBACK = "Coś poszło nie tak.";

function run(overrides: Partial<Parameters<typeof submitPublicForm>[0]> = {}) {
  return submitPublicForm({
    path: "/contact",
    body: { name: "Jan" },
    honeypot: "",
    fallbackError: FALLBACK,
    ...overrides,
  });
}

describe("submitPublicForm", () => {
  it("posts the body with the honeypot field appended and resolves to success", async () => {
    const post = vi.fn().mockResolvedValue({ ok: true });

    const result = await run({ post });

    expect(post).toHaveBeenCalledWith("/contact", {
      method: "POST",
      body: { name: "Jan", _hp: "" },
    });
    expect(result).toEqual({ outcome: "success" });
  });

  it("resolves to success without touching the network when the honeypot is filled", async () => {
    const post = vi.fn();

    const result = await run({ honeypot: "spam-bot", post });

    expect(post).not.toHaveBeenCalled();
    expect(result).toEqual({ outcome: "success" });
  });

  it("surfaces a server-provided ApiError message verbatim", async () => {
    const post = vi.fn().mockRejectedValue(new ApiError("Podaj poprawny e-mail.", 400));

    const result = await run({ post });

    expect(result).toEqual({ outcome: "error", message: "Podaj poprawny e-mail." });
  });

  it("falls back to the form's copy when the ApiError has no message", async () => {
    const post = vi.fn().mockRejectedValue(new ApiError("", 502));

    const result = await run({ post });

    expect(result).toEqual({ outcome: "error", message: FALLBACK });
  });

  it("falls back to the form's copy on non-API failures (network errors)", async () => {
    const post = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    const result = await run({ post });

    expect(result).toEqual({ outcome: "error", message: FALLBACK });
  });
});
