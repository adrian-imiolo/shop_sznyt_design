/**
 * Resolve the Postgres URL for the E2E suite — same shape as
 * backend/scripts/test-db-url.js but with an "_e2e" suffix, so the two
 * suites can never collide with each other or with the dev database.
 *
 * Uses E2E_DATABASE_URL when set; otherwise derives one from DATABASE_URL
 * by appending "_e2e" to the database name. Either way the resolved
 * database name MUST end in "_e2e" — a hard guard so the run's
 * migrate/truncate/seed cycle can never touch the dev or prod database.
 */
export function resolveE2eDatabaseUrl(
  env: { E2E_DATABASE_URL?: string; DATABASE_URL?: string } = process.env,
): string {
  const explicit = env.E2E_DATABASE_URL;
  const derivedFrom = env.DATABASE_URL;

  let urlString: string;
  if (explicit) {
    urlString = explicit;
  } else if (derivedFrom) {
    const url = new URL(derivedFrom);
    url.pathname = `${url.pathname}_e2e`;
    urlString = url.toString();
  } else {
    throw new Error(
      "E2E tests need E2E_DATABASE_URL (or DATABASE_URL to derive it from).",
    );
  }

  if (!new URL(urlString).pathname.endsWith("_e2e")) {
    throw new Error(
      `Refusing to run E2E tests: database name must end in "_e2e" (got ${new URL(urlString).pathname}).`,
    );
  }

  return urlString;
}
