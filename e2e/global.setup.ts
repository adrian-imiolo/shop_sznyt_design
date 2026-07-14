import { clerkSetup } from "@clerk/testing/playwright";
import { ensureClerkTestUser } from "./support/clerkBackend";

export default async function globalSetup(): Promise<void> {
  // Obtains a Clerk testing token so specs can drive sign-in without
  // tripping bot protection. Needs CLERK_SECRET_KEY and
  // CLERK_PUBLISHABLE_KEY, loaded from backend/.env by support/env.ts.
  await clerkSetup();

  // Playwright workers inherit env mutated here.
  process.env.E2E_CLERK_USER_ID = await ensureClerkTestUser();
}
