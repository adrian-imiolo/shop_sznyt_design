import { defineConfig } from "vitest/config";

// Without a local config vitest walks up and loads the frontend's vite.config
// (React plugin and all) — pin the backend suite to its own minimal setup.
// *.db.test.ts files need Postgres and run separately via `npm run test:db`.
export default defineConfig({
  test: {
    include: [
      "emails/**/*.test.ts",
      "middleware/**/*.test.ts",
      "orders/**/*.test.ts",
      "revenue/**/*.test.ts",
    ],
    exclude: ["**/*.db.test.ts", "**/node_modules/**"],
  },
});
