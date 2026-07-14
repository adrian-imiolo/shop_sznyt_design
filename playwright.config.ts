import { defineConfig } from "@playwright/test";
import { BACKEND_URL, E2E_DATABASE_URL, FRONTEND_URL } from "./e2e/support/env";

/**
 * E2E suite (issue #110): full dev stack against a dedicated e2e database,
 * reset on every run. Local-only — deliberately NOT wired into CI.
 *
 * Prerequisite: `stripe listen --forward-to localhost:3000/webhook` must be
 * running (the guest-checkout flow asserts on webhook side effects).
 * See e2e/README.md.
 */
export default defineConfig({
  testDir: "./e2e",
  // Only *.spec.ts are Playwright tests; e2e/**/*.test.ts are vitest units.
  testMatch: "**/*.spec.ts",
  globalSetup: "./e2e/global.setup.ts",
  // Real Stripe hosted checkout + webhook round-trips are slow.
  timeout: 120_000,
  expect: { timeout: 15_000 },
  // Both specs mutate the same database — keep runs serial.
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      // DB reset must precede boot: Playwright starts webServers before
      // globalSetup, and the readiness probe below already queries the DB.
      command: "node ../e2e/scripts/prepare-e2e-db.js && npx tsx index.js",
      cwd: "./backend",
      url: `${BACKEND_URL}/products`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        DATABASE_URL: E2E_DATABASE_URL,
        PORT: "3000",
        FRONTEND_URL,
        // Blank host short-circuits sendEmail (backend/emails/sendEmail.ts) —
        // e2e checkouts must not send real order emails. dotenv won't
        // override a variable that is already set, even to "".
        SMTP_HOST: "",
      },
    },
    {
      command: "npm run dev:frontend",
      url: FRONTEND_URL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
