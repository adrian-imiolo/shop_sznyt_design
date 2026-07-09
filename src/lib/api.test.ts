import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch, ApiError } from "./api";

function jsonResponse(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("apiFetch", () => {
  it("prefixes the path with the API base URL and returns parsed JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [{ id: 1 }]));

    const data = await apiFetch<{ id: number }[]>("/products");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/products",
      expect.objectContaining({ method: "GET" }),
    );
    expect(data).toEqual([{ id: 1 }]);
  });

  it("serializes body as JSON and sets Content-Type", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await apiFetch("/contact", { method: "POST", body: { name: "Jan" } });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(JSON.stringify({ name: "Jan" }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("attaches a Bearer token from the auth provider", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiFetch("/orders", { auth: async () => "tok_123" });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok_123");
  });

  it("sends no Content-Type or Authorization headers when not asked to", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiFetch("/products");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({});
  });

  it("throws ApiError carrying the server's error message on non-ok responses", async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: "Brak produktu" }));

    const err = await apiFetch("/products/999").catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe("Brak produktu");
    expect((err as ApiError).status).toBe(400);
  });

  it("throws ApiError with an empty message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }));

    const err = await apiFetch("/products").catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe("");
    expect((err as ApiError).status).toBe(502);
  });

  it("returns undefined for an empty ok response body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/orders/1/fulfillment", { method: "PATCH" })).resolves.toBeUndefined();
  });

  it("lets network failures propagate untouched", async () => {
    const boom = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValue(boom);

    await expect(apiFetch("/products")).rejects.toBe(boom);
  });
});
