/**
 * Supertest smoke test for the createApp() seam (issue #106): the whole
 * Express app runs over HTTP against the real test database, with fakes
 * injected for auth, Stripe, and mail.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { useAppHarness } from "./harness.ts";

const harness = useAppHarness();

describe("createApp smoke test — GET /products", () => {
  it("serves seeded products over HTTP with all fakes injected", async () => {
    await harness.prisma.product.createMany({
      data: [
        { name: "Rama Dębowa 30×40", price: 149.99, stock: 5 },
        { name: "Rama Jesionowa 21×30", price: 89, stock: 2 },
      ],
    });

    const res = await request(harness.appAs().app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ name: "Rama Dębowa 30×40", price: 149.99 });
    expect(res.body[1]).toMatchObject({ name: "Rama Jesionowa 21×30", price: 89 });
  });
});
