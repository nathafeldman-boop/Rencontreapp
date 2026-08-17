/**
 * Extra analysis runs a free (non-subscribed) user can trigger from
 * /results on top of their original onboarding analysis, before hitting
 * the paywall — keeps the pre-payment funnel from grinding unlimited free
 * Mistral calls. Shared between the regenerate route (enforcement) and the
 * results page (computing how many are left to show/hide the UI).
 */
export const MAX_FREE_REGENERATIONS = 3;

/**
 * Accounts explicitly exempted from MAX_FREE_REGENERATIONS — content
 * creation/demo accounts that need to show the free (non-premium) flow
 * repeatedly on camera without hitting the paywall or getting a real
 * subscription (which would change which UI/funnel they see). Keyed by
 * user id, not email, and never granted a `subscriptions` row.
 */
export const UNLIMITED_REGENERATION_USER_IDS = new Set<string>([
  "9614fcd2-1604-4fe0-933a-9c93eb611926", // saasfounderpro@gmail.com — TikTok content account
]);
