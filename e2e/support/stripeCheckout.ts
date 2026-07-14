import type { Page } from "@playwright/test";

/**
 * Drive Stripe's hosted test-mode checkout with the standard 4242 card.
 * The page is plain DOM (no iframes, unlike Stripe Elements), so regular
 * locators work. Selectors are Stripe's stable ids/testids.
 */
export async function payWithTestCard(page: Page): Promise<void> {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });

  const cardNumber = page.locator("#cardNumber");
  const cardRadio = page.getByRole("radio", { name: "Card" });

  // With P24/BLIK also offered, the card form is collapsed behind the
  // payment-method radio list until "Card" is selected.
  await cardNumber.or(cardRadio).first().waitFor({ state: "attached", timeout: 30_000 });
  if (!(await cardNumber.isVisible())) {
    // The radio sits under an invisible expanded-click-area overlay that
    // intercepts pointer events (and fails visible-checks itself) — hand
    // the click straight to Stripe's accordion button.
    await page.getByTestId("card-accordion-item-button").dispatchEvent("click");
  }

  await cardNumber.fill("4242 4242 4242 4242");
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("E2E Tester");

  const postalCode = page.locator("#billingPostalCode");
  if (await postalCode.isVisible()) {
    await postalCode.fill("00-001");
  }

  await page
    .getByTestId("hosted-payment-submit-button")
    .or(page.getByRole("button", { name: "Pay", exact: true }))
    .first()
    .click();
}

/**
 * Wait for Stripe to land us back on /sukces. Dev gotcha (CLAUDE.md):
 * Chrome may upgrade the http success_url to https and fail TLS on
 * localhost — recover by re-issuing the navigation over http.
 */
export async function waitForSuccessRedirect(page: Page): Promise<void> {
  try {
    await page.waitForURL("**/sukces**", { timeout: 60_000 });
  } catch (err) {
    const url = new URL(page.url());
    if (url.protocol === "https:" && url.hostname === "localhost" && url.pathname === "/sukces") {
      url.protocol = "http:";
      await page.goto(url.toString());
      return;
    }
    throw err;
  }
}
