import { describe, expect, it } from "vitest";
import { notifyOrderShipped } from "./notifyOrderShipped.ts";
import type { ShippedOrderData } from "./notifyOrderShipped.ts";
import type { SendEmailOptions } from "../emails/index.ts";

function fakeMailer() {
  const sent: SendEmailOptions[] = [];
  return {
    sent,
    async send(options: SendEmailOptions) {
      sent.push(options);
    },
  };
}

function shippedOrder(overrides: Partial<ShippedOrderData> = {}): ShippedOrderData {
  return {
    id: 13,
    fulfillmentStatus: "shipped",
    customerEmail: "kupujacy@example.com",
    shippingMethod: "paczkomat",
    ...overrides,
  };
}

describe("notifyOrderShipped", () => {
  it("emails the customer when shipped with email and tracking number", async () => {
    const mailer = fakeMailer();

    await notifyOrderShipped(mailer, shippedOrder(), "DPD123456");

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("kupujacy@example.com");
    expect(mailer.sent[0].subject).toContain("wysłane");
    expect(mailer.sent[0].html).toContain("#13");
    expect(mailer.sent[0].html).toContain("DPD123456");
    expect(mailer.sent[0].html).toContain("InPost Paczkomat");
  });

  it.each([null, undefined, ""])(
    "sends nothing when the tracking number is %s",
    async (trackingNumber) => {
      const mailer = fakeMailer();

      await notifyOrderShipped(mailer, shippedOrder(), trackingNumber);

      expect(mailer.sent).toHaveLength(0);
    },
  );

  it.each(["pending", "processing", "delivered"])(
    "sends nothing when the fulfillment status is %s",
    async (fulfillmentStatus) => {
      const mailer = fakeMailer();

      await notifyOrderShipped(mailer, shippedOrder({ fulfillmentStatus }), "DPD123456");

      expect(mailer.sent).toHaveLength(0);
    },
  );

  it("sends nothing when the order has no customer email", async () => {
    const mailer = fakeMailer();

    await notifyOrderShipped(mailer, shippedOrder({ customerEmail: null }), "DPD123456");

    expect(mailer.sent).toHaveLength(0);
  });

  it("swallows a send failure instead of throwing", async () => {
    const failingMailer = {
      async send() {
        throw new Error("SMTP down");
      },
    };

    await expect(
      notifyOrderShipped(failingMailer, shippedOrder(), "DPD123456"),
    ).resolves.toBeUndefined();
  });
});
