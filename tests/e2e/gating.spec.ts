import { test, expect } from "@playwright/test";

const AUTH_ONLY_ROUTES = ["/onboarding", "/analyze", "/results", "/paywall", "/settings", "/referrals", "/premium"];
const PREMIUM_ROUTES = [
  "/dashboard",
  "/dashboard/photos",
  "/dashboard/bio",
  "/dashboard/coach",
  "/dashboard/simulator",
  "/dashboard/plan",
];

// The auth gate is temporarily disabled (AUTH_GATE_ENABLED = false in
// lib/supabase/proxy.ts) so the app can be reviewed end-to-end pre-launch
// without repeated sign-ins. These routes load without redirecting while
// that flag is off. Revert this test to the redirect assertion once the
// gate is re-enabled.
test.describe("Gated routes load without a session while the auth gate is off", () => {
  for (const path of [...AUTH_ONLY_ROUTES, ...PREMIUM_ROUTES]) {
    test(`${path} responds 200 without redirecting to /auth/login`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page).not.toHaveURL(/\/auth\/login/);
    });
  }
});

test.describe("Referral link redirect", () => {
  test("/r/<code> redirects to the landing page", async ({ page }) => {
    await page.goto("/r/testcode1");
    await expect(page).toHaveURL("/");
  });
});
