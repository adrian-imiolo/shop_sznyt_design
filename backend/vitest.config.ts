import { defineConfig } from "vitest/config";

// Without a local config vitest walks up and loads the frontend's vite.config
// (React plugin and all) — pin the backend suite to its own minimal setup.
export default defineConfig({
  test: {
    include: ["emails/**/*.test.ts"],
  },
});
