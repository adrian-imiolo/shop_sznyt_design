/**
 * Resolve the Postgres URL for the DB-backed test suite.
 *
 * Uses TEST_DATABASE_URL when set; otherwise derives one from DATABASE_URL
 * by appending "_test" to the database name. Either way the resolved
 * database name MUST end in "_test" — a hard guard so the suite can never
 * truncate the dev or prod database.
 */
export function resolveTestDatabaseUrl() {
  const explicit = process.env.TEST_DATABASE_URL;
  const derivedFrom = process.env.DATABASE_URL;

  let urlString;
  if (explicit) {
    urlString = explicit;
  } else if (derivedFrom) {
    const url = new URL(derivedFrom);
    url.pathname = `${url.pathname}_test`;
    urlString = url.toString();
  } else {
    throw new Error(
      "DB tests need TEST_DATABASE_URL (or DATABASE_URL to derive it from).",
    );
  }

  if (!new URL(urlString).pathname.endsWith("_test")) {
    throw new Error(
      `Refusing to run DB tests: database name must end in "_test" (got ${new URL(urlString).pathname}).`,
    );
  }

  return urlString;
}
