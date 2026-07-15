/**
 * Unit tests for the shared serverError middleware (issue #115): any error
 * that reaches the end of the chain becomes the one canonical 500 shape the
 * per-route try/catch blocks used to produce.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import { serverError } from "./errors.js";

function appWithThrowingRoute() {
  const app = express();
  app.get("/boom", async function boom() {
    throw new Error("database exploded");
  });
  app.get("/ok", function ok(_req, res) {
    res.json({ ok: true });
  });
  app.use(serverError);
  return app;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("serverError", () => {
  it("turns a rejected async handler into the canonical 500 shape", async () => {
    const res = await request(appWithThrowingRoute()).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Błąd serwera" });
  });

  it("logs the original error for diagnostics", async () => {
    await request(appWithThrowingRoute()).get("/boom");

    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: "database exploded" }),
    );
  });

  it("does not touch successful responses", async () => {
    const res = await request(appWithThrowingRoute()).get("/ok");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
