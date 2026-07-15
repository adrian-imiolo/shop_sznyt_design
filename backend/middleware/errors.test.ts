/**
 * Tests for the shared serverError middleware (issue #115), exercised
 * through the real createApp wiring: a route whose prisma call rejects must
 * come back as the one canonical 500 shape the per-route try/catch blocks
 * used to produce. No database needed — prisma is a stub.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { fakeAuth, fakeStripe, captureMailer } from "../test/fakes.ts";

function appWithPrisma(prisma: object) {
  return createApp({
    auth: fakeAuth(),
    stripe: fakeStripe(),
    mailer: captureMailer(),
    prisma,
  });
}

const explodingPrisma = {
  product: {
    findMany: async () => {
      throw new Error("database exploded");
    },
  },
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("serverError middleware via createApp", () => {
  it("turns a rejected handler into the canonical 500 shape", async () => {
    const res = await request(appWithPrisma(explodingPrisma)).get("/products");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Błąd serwera" });
  });

  it("logs the original error for diagnostics", async () => {
    await request(appWithPrisma(explodingPrisma)).get("/products");

    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: "database exploded" }),
    );
  });

  it("does not touch successful responses", async () => {
    const healthyPrisma = { product: { findMany: async () => [] } };

    const res = await request(appWithPrisma(healthyPrisma)).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
