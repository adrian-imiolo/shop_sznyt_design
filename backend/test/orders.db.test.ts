/**
 * Integration tests for the orders routes (issue #108) over HTTP against the
 * real test database. Ownership is the core of the coverage: user A must not
 * read user B's orders, guest orders stay hidden behind the by-session lookup,
 * and admins bypass ownership for back-office work.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { useAppHarness } from "./harness.ts";

const harness = useAppHarness();

const anonymous = () => harness.appAs().app;
const asUser = (userId: string) => harness.appAs({ userId }).app;
const admin = () => harness.appAs({ userId: "user_admin", role: "admin" });

/** Paid order with one line item, owned by `userId` (null = guest). */
async function seedOrder({
  userId,
  sessionId,
  total = 149.99,
  customerEmail = "kupujacy@example.com",
}: {
  userId: string | null;
  sessionId: string;
  total?: number;
  customerEmail?: string | null;
}) {
  const product = await harness.prisma.product.create({
    data: { name: "Rama Dębowa 30×40", price: 149.99, stock: 5 },
  });
  return harness.prisma.order.create({
    data: {
      stripeSessionId: sessionId,
      status: "paid",
      total,
      userId,
      customerEmail,
      shippingMethod: "dpd",
      items: { create: [{ quantity: 1, price: 149.99, productId: product.id }] },
    },
  });
}

describe("GET /orders — admin boundary", () => {
  it("rejects anonymous callers with 401", async () => {
    const res = await request(anonymous()).get("/orders");

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const res = await request(asUser("user_a")).get("/orders");

    expect(res.status).toBe(403);
  });

  it("lists all orders as admin, newest first", async () => {
    await seedOrder({ userId: "user_a", sessionId: "cs_1" });
    await seedOrder({ userId: "user_b", sessionId: "cs_2" });

    const res = await request(admin().app).get("/orders");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /orders/:id — ownership", () => {
  it("rejects anonymous callers with 401", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });

    const res = await request(anonymous()).get(`/orders/${order.id}`);

    expect(res.status).toBe(401);
  });

  it("returns the owner's order with its items", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });

    const res = await request(asUser("user_a")).get(`/orders/${order.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: order.id, userId: "user_a", total: 149.99 });
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].product).toMatchObject({ name: "Rama Dębowa 30×40" });
  });

  it("user A cannot read user B's order (403)", async () => {
    const order = await seedOrder({ userId: "user_b", sessionId: "cs_1" });

    const res = await request(asUser("user_a")).get(`/orders/${order.id}`);

    expect(res.status).toBe(403);
  });

  it("guest orders (userId=null) are hidden from other signed-in users (403)", async () => {
    const order = await seedOrder({ userId: null, sessionId: "cs_guest" });

    const res = await request(asUser("user_a")).get(`/orders/${order.id}`);

    expect(res.status).toBe(403);
  });

  it("admin can read any order, guest ones included", async () => {
    const order = await seedOrder({ userId: null, sessionId: "cs_guest" });

    const res = await request(admin().app).get(`/orders/${order.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
  });

  it("returns 404 for a missing order", async () => {
    const res = await request(asUser("user_a")).get("/orders/999");

    expect(res.status).toBe(404);
  });
});

describe("GET /orders/user/:userId — ownership", () => {
  it("rejects anonymous callers with 401", async () => {
    const res = await request(anonymous()).get("/orders/user/user_a");

    expect(res.status).toBe(401);
  });

  it("user A cannot list user B's orders (403)", async () => {
    await seedOrder({ userId: "user_b", sessionId: "cs_1" });

    const res = await request(asUser("user_a")).get("/orders/user/user_b");

    expect(res.status).toBe(403);
  });

  it("returns only the caller's own orders, with items", async () => {
    await seedOrder({ userId: "user_a", sessionId: "cs_1" });
    await seedOrder({ userId: "user_b", sessionId: "cs_2" });

    const res = await request(asUser("user_a")).get("/orders/user/user_a");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ userId: "user_a" });
    expect(res.body[0].items).toHaveLength(1);
  });
});

describe("GET /orders/by-session/:sessionId — public success-page lookup", () => {
  it("returns the order for a known Stripe session id", async () => {
    await seedOrder({ userId: null, sessionId: "cs_known" });

    const res = await request(anonymous()).get("/orders/by-session/cs_known");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ stripeSessionId: "cs_known" });
    expect(res.body.items).toHaveLength(1);
  });

  it("returns 404 for an unknown session id", async () => {
    const res = await request(anonymous()).get("/orders/by-session/cs_unknown");

    expect(res.status).toBe(404);
  });
});

describe("PATCH /orders/:id/fulfillment — admin boundary + shipped email", () => {
  it("rejects anonymous callers with 401", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });

    const res = await request(anonymous())
      .patch(`/orders/${order.id}/fulfillment`)
      .send({ fulfillmentStatus: "processing" });

    expect(res.status).toBe(401);
  });

  it("rejects signed-in non-admins with 403", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });

    const res = await request(asUser("user_a"))
      .patch(`/orders/${order.id}/fulfillment`)
      .send({ fulfillmentStatus: "processing" });

    expect(res.status).toBe(403);
  });

  it("rejects a status outside FULFILLMENT_STATUSES with 400", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });

    const res = await request(admin().app)
      .patch(`/orders/${order.id}/fulfillment`)
      .send({ fulfillmentStatus: "teleported" });

    expect(res.status).toBe(400);
  });

  it("updates status + tracking and emails the customer when shipped", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });
    const { app, mailer } = admin();

    const res = await request(app)
      .patch(`/orders/${order.id}/fulfillment`)
      .send({ fulfillmentStatus: "shipped", trackingNumber: "DPD123456" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      fulfillmentStatus: "shipped",
      trackingNumber: "DPD123456",
    });

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("kupujacy@example.com");
    expect(mailer.sent[0].subject).toContain("wysłane");
    expect(mailer.sent[0].html).toContain(`#${order.id}`);
    expect(mailer.sent[0].html).toContain("DPD123456");
  });

  it("sends no email when shipped without a tracking number", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });
    const { app, mailer } = admin();

    const res = await request(app)
      .patch(`/orders/${order.id}/fulfillment`)
      .send({ fulfillmentStatus: "shipped" });

    expect(res.status).toBe(200);
    expect(res.body.trackingNumber).toBeNull();
    expect(mailer.sent).toHaveLength(0);
  });

  it("sends no email for non-shipped status changes", async () => {
    const order = await seedOrder({ userId: "user_a", sessionId: "cs_1" });
    const { app, mailer } = admin();

    const res = await request(app)
      .patch(`/orders/${order.id}/fulfillment`)
      .send({ fulfillmentStatus: "processing" });

    expect(res.status).toBe(200);
    expect(mailer.sent).toHaveLength(0);
  });
});
