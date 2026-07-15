/**
 * Integration tests for the money path's checkout side (issue #107):
 * POST /create-checkout-session over HTTP against the real test database,
 * with the outbound Stripe client faked (createdSessions records the params
 * the app would send to Stripe).
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { fakeStripe } from "./fakes.ts";
import { useAppHarness } from "./harness.ts";

const harness = useAppHarness({ env: { FRONTEND_URL: "https://shop.test" } });

function buildApp({ stripe = fakeStripe() as object }: { stripe?: object | null } = {}) {
  return harness.appAs({}, { stripe }).app;
}

/** The slice of Stripe session-create params the tests assert on. */
type RecordedSessionParams = {
  mode: string;
  customer_email?: string;
  success_url: string;
  line_items: Array<{
    quantity: number;
    price_data: { unit_amount: number; product_data: { metadata: Record<string, string> } };
  }>;
  metadata: Record<string, string>;
};

const shippingAddress = {
  firstName: "Jan",
  lastName: "Kowalski",
  street: "Lipowa 1",
  city: "Poznań",
  postalCode: "60-001",
  phone: "+48 500 100 200",
  email: "kupujacy@example.com",
};

describe("POST /create-checkout-session", () => {
  it("creates a server-priced session and returns its url", async () => {
    await harness.prisma.product.create({
      data: { name: "Rama Dębowa 30×40", price: 149.99, stock: 5, imageUrl: "/ramy/debowa.jpg" },
    });
    const stripe = fakeStripe({ checkoutSessionUrl: "https://stripe.test/pay/cs_1" });
    const app = buildApp({ stripe });

    const res = await request(app)
      .post("/create-checkout-session")
      .send({
        items: [{ id: 1, quantity: 2, price: 1 }], // client price is ignored — server-authoritative
        userId: "user_abc",
        shippingMethod: "dpd",
        shippingAddress,
        note: "Proszę o ostrożne pakowanie",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ url: "https://stripe.test/pay/cs_1" });

    expect(stripe.createdSessions).toHaveLength(1);
    const session = stripe.createdSessions[0] as RecordedSessionParams;
    expect(session.mode).toBe("payment");
    expect(session.customer_email).toBe("kupujacy@example.com");
    expect(session.success_url).toBe(
      "https://shop.test/sukces?session_id={CHECKOUT_SESSION_ID}",
    );

    // Line-item contract: product line stamped with metadata.productId and
    // DB-priced; shipping line carries no productId.
    const [productLine, shippingLine] = session.line_items;
    expect(productLine.quantity).toBe(2);
    expect(productLine.price_data.unit_amount).toBe(14999);
    expect(productLine.price_data.product_data.metadata).toEqual({ productId: "1" });
    expect(shippingLine.price_data.product_data.metadata).toEqual({});

    expect(session.metadata).toMatchObject({
      userId: "user_abc",
      shippingMethod: "dpd",
      note: "Proszę o ostrożne pakowanie",
    });
    expect(JSON.parse(session.metadata.shippingAddress)).toEqual(shippingAddress);
  });

  it("rejects checkout above available stock with 409 and creates no session", async () => {
    await harness.prisma.product.create({
      data: { name: "Rama Dębowa 30×40", price: 149.99, stock: 1 },
    });
    const stripe = fakeStripe();
    const app = buildApp({ stripe });

    const res = await request(app)
      .post("/create-checkout-session")
      .send({
        items: [{ id: 1, quantity: 3 }],
        shippingMethod: "dpd",
        shippingAddress,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("Niewystarczająca ilość");
    expect(stripe.createdSessions).toHaveLength(0);
  });

  it("returns 503 in demo mode (no Stripe configured)", async () => {
    const app = buildApp({ stripe: null });

    const res = await request(app)
      .post("/create-checkout-session")
      .send({ items: [{ id: 1, quantity: 1 }], shippingMethod: "dpd", shippingAddress });

    expect(res.status).toBe(503);
  });
});
