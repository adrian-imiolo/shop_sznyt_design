/**
 * Test fakes for the createApp() injection seams (issue #106).
 *
 * Each fake satisfies the narrow surface the app actually uses — not the
 * full Clerk/Stripe/nodemailer APIs. Grow them per test, not speculatively.
 */
import type { SendEmailOptions } from "../emails/sendEmail.ts";

// Minimal structural types so the fakes don't need @types/express.
type Req = Record<string, unknown>;
type Res = { status: (code: number) => Res; json: (body: unknown) => void };
type Next = () => void;

export interface FakeAuthOptions {
  userId?: string | null;
  role?: "admin" | null;
}

/**
 * Impersonates a signed-in user (or anonymous when userId is null).
 * Mirrors the { middleware, requireAuth, getAuth } seam the entrypoint
 * wires from @clerk/express.
 */
export function fakeAuth({ userId = null, role = null }: FakeAuthOptions = {}) {
  return {
    middleware: (_req: Req, _res: Res, next: Next) => next(),
    requireAuth: () => (_req: Req, res: Res, next: Next) => {
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      next();
    },
    // Called as getAuth(req), but impersonation is fixed at construction —
    // the request is irrelevant, so the fake takes no parameters.
    getAuth: () => ({
      userId,
      sessionClaims: role ? { metadata: { role } } : undefined,
    }),
  };
}

export interface FakeStripeOptions {
  /** Event returned by webhooks.constructEvent; null simulates a bad signature. */
  webhookEvent?: { type: string; data: { object: unknown } } | null;
  /** Line items returned for the webhook's listLineItems call. */
  lineItems?: unknown[];
  checkoutSessionUrl?: string;
}

/** Records checkout.sessions.create calls; webhook behavior is configurable. */
export function fakeStripe({
  webhookEvent = null,
  lineItems = [],
  checkoutSessionUrl = "https://stripe.test/checkout",
}: FakeStripeOptions = {}) {
  const createdSessions: unknown[] = [];
  return {
    createdSessions,
    checkout: {
      sessions: {
        create: async (params: unknown) => {
          createdSessions.push(params);
          return { id: "cs_test_fake", url: checkoutSessionUrl };
        },
        listLineItems: async () => ({ data: lineItems }),
      },
    },
    paymentIntents: {
      retrieve: async () => ({ latest_charge: null }),
    },
    webhooks: {
      constructEvent: () => {
        if (!webhookEvent) {
          throw new Error("Invalid signature (fakeStripe: no webhookEvent configured)");
        }
        return webhookEvent;
      },
    },
  };
}

/** Records every rendered email instead of sending it. */
export function captureMailer() {
  const sent: SendEmailOptions[] = [];
  return {
    sent,
    send: async (options: SendEmailOptions) => {
      sent.push(options);
    },
  };
}
