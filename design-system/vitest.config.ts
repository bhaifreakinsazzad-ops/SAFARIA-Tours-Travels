import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    // Embedded PostgreSQL 18's cold start (first-run binary setup inside a
    // freshly `npm ci`'d node_modules, as a fresh-extraction/CI runner
    // would see) can exceed the default hook timeout and fail the suite
    // with "Hook timed out" rather than a real assertion failure. Verified
    // this against a from-scratch ZIP extraction during this audit.
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
