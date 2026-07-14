import { E2E_CLERK_USER_EMAIL } from "./env";

const CLERK_API = "https://api.clerk.com/v1";

async function clerkApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(
      `Clerk API ${init.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as T;
}

/** Find-or-create the E2E test identity. Passwordless — sign-in happens via sign-in tokens. */
export async function ensureClerkTestUser(): Promise<string> {
  const existing = await clerkApi<{ id: string }[]>(
    `/users?email_address=${encodeURIComponent(E2E_CLERK_USER_EMAIL)}`,
  );
  if (existing.length > 0) return existing[0].id;

  const created = await clerkApi<{ id: string }>("/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [E2E_CLERK_USER_EMAIL],
      // This Clerk instance requires a username at sign-up
      username: "e2e_clerk_test",
      skip_password_requirement: true,
    }),
  });
  return created.id;
}

/**
 * Mint a single-use sign-in token for the test user. The browser exchanges
 * it via the "ticket" strategy — completing sign-in without a password and
 * bypassing the second factor this instance otherwise requires (which rules
 * out plain password sign-in for a robot user).
 */
export async function createSignInToken(userId: string): Promise<string> {
  const created = await clerkApi<{ token: string }>("/sign_in_tokens", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  return created.token;
}
