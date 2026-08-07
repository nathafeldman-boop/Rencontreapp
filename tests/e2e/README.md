# E2E smoke tests

Run with `npm run test:e2e` (starts the dev server automatically).

## What's covered

- Every public marketing/SEO/blog page returns 200 and renders its H1 + CTA.
- `sitemap.xml` / `robots.txt` are well-formed and list the expected pages.
- Every route that requires auth (`/onboarding` through `/dashboard/*`)
  redirects an unauthenticated visitor to `/auth/login`.
- `/r/<code>` redirects correctly (cookie-setting itself isn't asserted here
  — see below).

## What's NOT covered (needs seeded test accounts)

These require a real Supabase project with Google OAuth configured and
Stripe in test mode — out of reach for an automated suite running without
those credentials:

- Full signup → onboarding → upload → analysis → results flow.
- Paywall → Stripe Checkout → webhook → dashboard unlock.
- Any of the 5 premium AI tools actually calling Mistral.
- Referral attribution end-to-end (cookie → signup → reward granted).

Run those manually against a staging Supabase + Stripe test-mode project
before each release — see the QA checklist in the main README.
