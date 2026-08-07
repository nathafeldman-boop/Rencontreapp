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

test.describe("Unauthenticated access is redirected to login", () => {
  for (const path of [...AUTH_ONLY_ROUTES, ...PREMIUM_ROUTES]) {
    test(`${path} redirects to /auth/login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});

test.describe("Referral link redirect", () => {
  test("/r/<code> redirects to the landing page", async ({ page }) => {
    await page.goto("/r/testcode1");
    await expect(page).toHaveURL("/");
  });
});
