import { test, expect } from "@playwright/test";

test.describe("Free funnel: public pages load", () => {
  test("landing page has a headline and a working CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const cta = page.getByRole("link", { name: /free/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("login page renders both auth methods", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  });

  for (const path of ["/tinder-profile-review", "/hinge-profile-review", "/bumble-profile-review"]) {
    test(`${path} loads with an H1 and CTA`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByRole("link", { name: /free/i }).first()).toBeVisible();
    });
  }

  test("/ai-dating-coach loads", async ({ page }) => {
    const res = await page.goto("/ai-dating-coach");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("/tinder-bio-generator loads", async ({ page }) => {
    const res = await page.goto("/tinder-bio-generator");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("blog index lists articles that link to working posts", async ({ page }) => {
    await page.goto("/blog");
    const firstPost = page.locator("a[href^='/blog/']").first();
    await expect(firstPost).toBeVisible();
    await firstPost.click();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /analyze my profile free/i })).toBeVisible();
  });

  test("sitemap.xml is valid XML listing known pages", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/tinder-profile-review");
    expect(body).toContain("/blog/how-to-get-more-tinder-matches");
  });

  test("robots.txt disallows authenticated app routes", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("Disallow: /dashboard");
    expect(body).toContain("Sitemap:");
  });
});
