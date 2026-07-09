import { defineConfig } from "vitest/config";

// DB-backed suite: needs a Postgres test database (name must end in "_test";
// see scripts/test-db-url.js). One-time setup: `npm run test:db:prepare`.
// Tests truncate tables between cases, so they run single-threaded.
export default defineConfig({
  test: {
    include: ["**/*.db.test.ts"],
    exclude: ["**/node_modules/**"],
    fileParallelism: false,
  },
});
