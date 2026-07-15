/**
 * Integration tests for the money path's webhook side (issue #107): the
 * whole app over HTTP against the real test database.
 *
 * Signature verification stays ON — the injected stripe client keeps the
 * real `webhooks` object (pure HMAC, no network), and payloads are signed
 * with `generateTestHeaderString` + a test secret. Only outbound Stripe
 * calls (listLineItems, paymentIntents) are faked.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import Stripe from "stripe";
import type { createApp } from "../app.js";
import { fakeStripe } from "./fakes.ts";
import { useAppHarness } from "./harness.ts";

const TEST_WEBHOOK_SECRET = "whsec_test_integration_secret";
const ADMIN_RECIPIENT = "admin@test.local";

// Real signature tooling — constructEvent/generateTestHeaderString are
// offline crypto; the API key is never used.
const signatureKit = new Stripe("sk_test_offline_signature_only");

const harness = useAppHarness({
  env: {
    STRIPE_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
    CONTACT_RECIPIENT: ADMIN_RECIPIENT,
  },
});

/** Stripe line item as listLineItems returns it (price.product expanded). */
function stripeLineItem({
  productId,
  name,
  quantity,
  unitAmount,
}: {
  productId: number | null;
  name: string;
  quantity: number;
  unitAmount: number;
}) {
  return {
    description: name,
    quantity,
    price: {
      unit_amount: unitAmount,
      product: {
        name,
        metadata: productId === null ? {} : { productId: String(productId) },
      },
    },
  };
}

function completedSessionEvent(session: Record<string, unknown>) {
  return {
    id: "evt_test_1",
    type: "checkout.session.completed",
    data: { object: session },
  };
}

function signedPost(
  app: ReturnType<typeof createApp>,
  payload: string,
  { tamper = false }: { tamper?: boolean } = {},
) {
  const signature = signatureKit.webhooks.generateTestHeaderString({
    payload,
    secret: TEST_WEBHOOK_SECRET,
  });
  const body = tamper
    ? payload.replace('"amount_total":', '"amount_total": 1,"x":')
    : payload;
  return request(app)
    .post("/webhook")
    .set("stripe-signature", signature)
    .set("content-type", "application/json")
    .send(body);
}

function buildApp({ lineItems = [] as unknown[] } = {}) {
  const stripe = {
    ...fakeStripe({ lineItems }),
    // Real verification path — a forged or tampered payload must be
    // rejected by the same code that runs in production.
    webhooks: signatureKit.webhooks,
  };
  return harness.appAs({}, { stripe });
}

describe("POST /webhook — checkout.session.completed", () => {
  const session = {
    id: "cs_test_paid_1",
    amount_total: 32498, // 2×149.99 + 25.00 shipping, in grosze
    payment_intent: null,
    customer_details: { email: "kupujacy@example.com" },
    metadata: {
      userId: "user_abc",
      shippingMethod: "dpd",
      shippingAddress: JSON.stringify({
        firstName: "Jan",
        lastName: "Kowalski",
        street: "Lipowa 1",
        city: "Poznań",
        postalCode: "60-001",
        phone: "+48 500 100 200",
        email: "kupujacy@example.com",
      }),
      note: "Proszę o ostrożne pakowanie",
    },
  };
  const lineItems = [
    stripeLineItem({ productId: 1, name: "Rama Dębowa 30×40", quantity: 2, unitAmount: 14999 }),
    stripeLineItem({ productId: null, name: "Dostawa — DPD Kurier", quantity: 1, unitAmount: 2500 }),
  ];

  async function seedProduct() {
    await harness.prisma.product.create({
      data: { name: "Rama Dębowa 30×40", price: 149.99, stock: 5 },
    });
  }

  it("accepts a validly signed payload: records the order and decrements stock", async () => {
    await seedProduct();
    const { app } = buildApp({ lineItems });

    const res = await signedPost(app, JSON.stringify(completedSessionEvent(session)));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const orderRes = await request(app).get("/orders/by-session/cs_test_paid_1");
    expect(orderRes.status).toBe(200);
    expect(orderRes.body).toMatchObject({
      status: "paid",
      total: 324.98,
      customerEmail: "kupujacy@example.com",
      userId: "user_abc",
      shippingMethod: "dpd",
      note: "Proszę o ostrożne pakowanie",
    });
    expect(orderRes.body.items).toHaveLength(1); // shipping line carries no productId
    expect(orderRes.body.items[0]).toMatchObject({
      productId: 1,
      quantity: 2,
      price: 149.99,
    });

    const productRes = await request(app).get("/products/1");
    expect(productRes.body.stock).toBe(3);
  });

  it("sends customer confirmation and admin notification emails", async () => {
    await seedProduct();
    const { app, mailer } = buildApp({ lineItems });

    await signedPost(app, JSON.stringify(completedSessionEvent(session)));

    expect(mailer.sent).toHaveLength(2);
    const [customerEmail, adminEmail] = mailer.sent;
    expect(customerEmail.to).toBe("kupujacy@example.com");
    expect(customerEmail.subject).toContain("zamówieni");
    expect(customerEmail.html).toContain("Rama Dębowa 30×40");
    expect(adminEmail.to).toBe(ADMIN_RECIPIENT);
    expect(adminEmail.html).toContain("Rama Dębowa 30×40");
  });

  it("rejects a tampered payload with 400 and records nothing", async () => {
    await seedProduct();
    const { app, mailer } = buildApp({ lineItems });

    const res = await signedPost(
      app,
      JSON.stringify(completedSessionEvent(session)),
      { tamper: true },
    );

    expect(res.status).toBe(400);
    const orderRes = await request(app).get("/orders/by-session/cs_test_paid_1");
    expect(orderRes.status).toBe(404);
    const productRes = await request(app).get("/products/1");
    expect(productRes.body.stock).toBe(5);
    expect(mailer.sent).toHaveLength(0);
  });

  it("rejects an unsigned payload with 400", async () => {
    await seedProduct();
    const { app } = buildApp({ lineItems });

    const res = await request(app)
      .post("/webhook")
      .set("content-type", "application/json")
      .send(JSON.stringify(completedSessionEvent(session)));

    expect(res.status).toBe(400);
    const orderRes = await request(app).get("/orders/by-session/cs_test_paid_1");
    expect(orderRes.status).toBe(404);
  });

  it("handles duplicate delivery idempotently: one order, one decrement, one email pair", async () => {
    await seedProduct();
    const { app, mailer } = buildApp({ lineItems });
    const payload = JSON.stringify(completedSessionEvent(session));

    const first = await signedPost(app, payload);
    const second = await signedPost(app, payload);

    // Stripe retries must get 200 for an already-recorded order, or it
    // keeps redelivering forever.
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const orders = await harness.prisma.order.findMany({
      where: { stripeSessionId: "cs_test_paid_1" },
    });
    expect(orders).toHaveLength(1);

    const productRes = await request(app).get("/products/1");
    expect(productRes.body.stock).toBe(3); // decremented once, not twice

    expect(mailer.sent).toHaveLength(2); // customer + admin, no retry duplicates
  });
});
