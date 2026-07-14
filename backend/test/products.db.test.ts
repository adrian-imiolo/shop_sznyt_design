/**
 * Integration tests for the products routes (issue #108): CRUD + reorder over
 * HTTP against the real test database. The core of the coverage is the admin
 * boundary — every mutating route rejects anonymous (401) and signed-in
 * non-admin (403) callers before touching the database.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import type { PrismaClient } from "../generated/prisma/client.js";
import { createTestPrisma, truncateCommerceTables } from "./db.ts";
import { createApp } from "../app.js";
import { fakeAuth, fakeStripe, captureMailer, type FakeAuthOptions } from "./fakes.ts";

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createTestPrisma();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await truncateCommerceTables(prisma);
});

function buildApp(authOptions: FakeAuthOptions = {}) {
  return createApp({
    auth: fakeAuth(authOptions),
    stripe: fakeStripe(),
    mailer: captureMailer(),
    prisma,
  });
}

const anonymous = () => buildApp();
const nonAdmin = () => buildApp({ userId: "user_regular" });
const admin = () => buildApp({ userId: "user_admin", role: "admin" });

const frameData = { name: "Rama Dębowa 30×40", price: 149.99, stock: 5 };

describe("GET /products/:id", () => {
  it("returns the product publicly", async () => {
    await prisma.product.create({ data: frameData });

    const res = await request(anonymous()).get("/products/1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(frameData);
  });

  it("returns 404 for a missing product", async () => {
    const res = await request(anonymous()).get("/products/999");

    expect(res.status).toBe(404);
  });
});

describe("POST /products — admin boundary", () => {
  const newProduct = { name: "Rama Orzechowa 40×50", price: 199, stock: 3 };

  it("rejects anonymous callers with 401", async () => {
    const res = await request(anonymous()).post("/products").send(newProduct);

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(nonAdmin()).post("/products").send(newProduct);

    expect(res.status).toBe(403);
  });

  it("creates the product as admin", async () => {
    const res = await request(admin()).post("/products").send(newProduct);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(newProduct);

    const list = await request(anonymous()).get("/products");
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toMatchObject(newProduct);
  });
});

describe("PUT /products/:id — admin boundary", () => {
  beforeEach(async () => {
    await prisma.product.create({ data: frameData });
  });

  it("rejects anonymous callers with 401", async () => {
    const res = await request(anonymous()).put("/products/1").send({ price: 1 });

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(nonAdmin()).put("/products/1").send({ price: 1 });

    expect(res.status).toBe(403);
  });

  it("updates the product as admin", async () => {
    const res = await request(admin())
      .put("/products/1")
      .send({ ...frameData, price: 179.99, stock: 8 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: frameData.name, price: 179.99, stock: 8 });
  });
});

describe("DELETE /products/:id — admin boundary", () => {
  beforeEach(async () => {
    await prisma.product.create({ data: frameData });
  });

  it("rejects anonymous callers with 401", async () => {
    const res = await request(anonymous()).delete("/products/1");

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(nonAdmin()).delete("/products/1");

    expect(res.status).toBe(403);
  });

  it("deletes the product as admin", async () => {
    const res = await request(admin()).delete("/products/1");

    expect(res.status).toBe(200);

    const after = await request(anonymous()).get("/products/1");
    expect(after.status).toBe(404);
  });
});

describe("PATCH /products/reorder — admin boundary", () => {
  beforeEach(async () => {
    await prisma.product.createMany({
      data: [
        { name: "Rama A", price: 100, sortOrder: 0 },
        { name: "Rama B", price: 120, sortOrder: 1 },
      ],
    });
  });

  it("rejects anonymous callers with 401", async () => {
    const res = await request(anonymous())
      .patch("/products/reorder")
      .send([{ id: 1, sortOrder: 1 }]);

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(nonAdmin())
      .patch("/products/reorder")
      .send([{ id: 1, sortOrder: 1 }]);

    expect(res.status).toBe(403);
  });

  it("reorders products as admin — GET /products reflects the new order", async () => {
    const res = await request(admin())
      .patch("/products/reorder")
      .send([
        { id: 1, sortOrder: 1 },
        { id: 2, sortOrder: 0 },
      ]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const list = await request(anonymous()).get("/products");
    expect(list.body.map((p: { name: string }) => p.name)).toEqual(["Rama B", "Rama A"]);
  });
});
