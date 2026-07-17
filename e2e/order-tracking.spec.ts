import { expect, test } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { createSignInToken } from "./support/clerkBackend";
import { queryE2e } from "./support/db";
import { E2E_CLERK_USER_EMAIL } from "./support/env";
import { E2E_ADDRESS, ORDER_TOTAL, SEED_PRODUCT } from "./support/fixtures";

const SHIPPING_ADDRESS = { ...E2E_ADDRESS, email: E2E_CLERK_USER_EMAIL };

test("order tracking: signed-in user sees their order in MyOrders and its detail page", async ({
  page,
}) => {
  // Clerk testing token + sign-in token (see clerkBackend.ts for why): sign
  // in programmatically — the flow under test is order tracking, not Clerk's
  // sign-in UI (issue #110).
  const userId = process.env.E2E_CLERK_USER_ID;
  if (!userId) throw new Error("E2E_CLERK_USER_ID not set — did global.setup.ts run?");
  const ticket = await createSignInToken(userId);

  await setupClerkTestingToken({ page });
  await page.goto("/");
  await clerk.loaded({ page });
  await page.evaluate(async (signInTicket) => {
    type ClerkClient = {
      client: {
        signIn: {
          create: (params: {
            strategy: string;
            ticket: string;
          }) => Promise<{ status: string; createdSessionId: string | null }>;
        };
      };
      setActive: (params: { session: string }) => Promise<void>;
    };
    const clerkGlobal = (window as unknown as { Clerk: ClerkClient }).Clerk;
    const attempt = await clerkGlobal.client.signIn.create({
      strategy: "ticket",
      ticket: signInTicket,
    });
    if (attempt.status !== "complete" || !attempt.createdSessionId) {
      throw new Error(`Ticket sign-in did not complete: ${attempt.status}`);
    }
    await clerkGlobal.setActive({ session: attempt.createdSessionId });
  }, ticket);

  // Session active — the navbar swaps "Zaloguj" for the user button.
  await expect(page.getByRole("button", { name: "Zaloguj" })).toBeHidden();

  // Fixture order straight into the e2e DB — order creation is covered by
  // the guest-checkout spec; here only the tracking surfaces are under test.
  const [orderRow] = await queryE2e<{ id: number }>(
    `INSERT INTO "Order"
       ("stripeSessionId", "status", "total", "customerEmail", "userId",
        "shippingMethod", "shippingAddress", "paymentMethod")
     VALUES ($1, 'paid', $2, $3, $4, 'inpost_kurier', $5, 'card')
     RETURNING id`,
    [
      `cs_test_e2e_tracking_${userId}`,
      ORDER_TOTAL,
      E2E_CLERK_USER_EMAIL,
      userId,
      JSON.stringify(SHIPPING_ADDRESS),
    ],
  );
  await queryE2e(
    'INSERT INTO "OrderItem" ("quantity", "price", "orderId", "productId") VALUES (1, $1, $2, $3)',
    [SEED_PRODUCT.price, orderRow.id, SEED_PRODUCT.id],
  );

  // MyOrders lists the order
  await page.goto("/moje-zamowienia");
  await expect(page.getByText(`Zamówienie #${orderRow.id}`)).toBeVisible();
  await expect(page.getByText(SEED_PRODUCT.name)).toBeVisible();
  await expect(page.getByText(`${ORDER_TOTAL}\u00A0PLN`)).toBeVisible();

  // Detail page shows items, address, and total
  await page.getByText(`Zamówienie #${orderRow.id}`).click();
  await expect(
    page.getByRole("heading", { name: `Zamówienie #${orderRow.id}` }),
  ).toBeVisible();
  await expect(page.getByText(`1 szt. × ${SEED_PRODUCT.price}\u00A0PLN`)).toBeVisible();
  await expect(page.getByText(E2E_ADDRESS.street).first()).toBeVisible();
  await expect(page.getByText(`${ORDER_TOTAL}\u00A0PLN`)).toBeVisible();
});
