import { describe, it, expect } from "vitest";
import { findBootEnvErrors } from "./bootEnv.ts";

const stripeConfigured = {
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  FRONTEND_URL: "http://localhost:5173",
};

const smtpConfigured = {
  SMTP_HOST: "s123.cyber-folks.pl",
  CONTACT_RECIPIENT: "kontakt@sznytdesign.pl",
};

describe("findBootEnvErrors", () => {
  it("passes an empty environment — demo mode configures neither Stripe nor SMTP", () => {
    expect(findBootEnvErrors({})).toEqual([]);
  });

  it("passes a fully configured production environment", () => {
    expect(findBootEnvErrors({ ...stripeConfigured, ...smtpConfigured })).toEqual([]);
  });

  it("rejects Stripe without a webhook secret", () => {
    const errors = findBootEnvErrors({
      ...stripeConfigured,
      STRIPE_WEBHOOK_SECRET: undefined,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("STRIPE_WEBHOOK_SECRET");
  });

  it("rejects Stripe without a frontend URL", () => {
    const errors = findBootEnvErrors({ ...stripeConfigured, FRONTEND_URL: undefined });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("FRONTEND_URL");
  });

  it("rejects SMTP without a notification recipient — contact and returns mail would be lost", () => {
    const errors = findBootEnvErrors({ ...stripeConfigured, SMTP_HOST: "smtp.example.com" });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("CONTACT_RECIPIENT");
    expect(errors[0]).toContain("SMTP_HOST");
  });

  it("allows a missing recipient when SMTP is off — demo mode sends nothing", () => {
    expect(findBootEnvErrors({ CONTACT_RECIPIENT: undefined })).toEqual([]);
  });

  it("reports every broken invariant at once", () => {
    expect(
      findBootEnvErrors({ STRIPE_SECRET_KEY: "sk_test_123", SMTP_HOST: "smtp.example.com" }),
    ).toHaveLength(2);
  });
});
