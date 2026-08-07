import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests only — see tests/e2e/README.md for what's covered vs. what
 * needs a seeded Supabase/Stripe test environment (manual QA checklist in
 * the project README covers the rest).
 */
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath = existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Falls back to Playwright's normal browser resolution (`npx
        // playwright install`) outside this sandbox, where the fixed path
        // above won't exist.
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
