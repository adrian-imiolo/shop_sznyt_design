import { expect, test } from "@playwright/test";
import { queryE2e } from "./support/db";
import { E2E_ADDRESS, ORDER_TOTAL, SEED_PRODUCT } from "./support/fixtures";
import { payWithTestCard, waitForSuccessRedirect } from "./support/stripeCheckout";

const ADDRESS = { ...E2E_ADDRESS, email: "e2e-guest@example.com" };

test("guest checkout: add to cart, pay with the 4242 card, order recorded and stock decremented", async ({
  page,
}) => {
  const [before] = await queryE2e<{ stock: number }>(
    'SELECT stock FROM "Product" WHERE id = $1',
    [SEED_PRODUCT.id],
  );
  expect(before.stock).toBeGreaterThan(0);

  // Browse → add to cart
  await page.goto(`/sklep/${SEED_PRODUCT.id}`);
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await expect(page.getByText("Dodano do koszyka!")).toBeVisible();

  // Checkout form
  await page.goto("/koszyk");
  await expect(page.getByRole("heading", { name: "Koszyk" })).toBeVisible();
  await page.locator('input[name="shipping"][value="inpost_kurier"]').check();

  await page.getByLabel("Imię").fill(ADDRESS.firstName);
  await page.getByLabel("Nazwisko").fill(ADDRESS.lastName);
  await page.getByLabel("Adres e-mail").fill(ADDRESS.email);
  await page.getByLabel("Ulica i numer").fill(ADDRESS.street);
  await page.getByLabel("Kod pocztowy").fill(ADDRESS.postalCode);
  await page.getByLabel("Miasto").fill(ADDRESS.city);
  await page.getByLabel("Telefon").fill(ADDRESS.phone);

  await page.getByRole("checkbox", { name: /Akceptuję/ }).check();
  await page.getByRole("button", { name: "Przejdź do płatności" }).click();

  // Real Stripe test-mode hosted checkout
  await payWithTestCard(page);
  await waitForSuccessRedirect(page);

  // Success page waits for the webhook (delivered via `stripe listen`)
  await expect(
    page.getByRole("heading", { name: "Dziękujemy za zamówienie!" }),
  ).toBeVisible({ timeout: 60_000 });

  const sessionId = new URL(page.url()).searchParams.get("session_id");
  expect(sessionId).toBeTruthy();

  // Order recorded by the webhook
  const [order] = await queryE2e<{ id: number; status: string; total: number; customerEmail: string }>(
    'SELECT id, status, total, "customerEmail" FROM "Order" WHERE "stripeSessionId" = $1',
    [sessionId],
  );
  expect(order).toBeDefined();
  expect(order.status).toBe("paid");
  expect(order.total).toBe(ORDER_TOTAL);
  expect(order.customerEmail).toBe(ADDRESS.email);
  await expect(page.getByText(`#${order.id}`)).toBeVisible();

  // Stock decremented atomically by the webhook
  const [after] = await queryE2e<{ stock: number }>(
    'SELECT stock FROM "Product" WHERE id = $1',
    [SEED_PRODUCT.id],
  );
  expect(after.stock).toBe(before.stock - 1);
});
