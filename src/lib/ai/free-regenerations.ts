/**
 * Extra analysis runs a free (non-subscribed) user can trigger from
 * /results on top of their original onboarding analysis, before hitting
 * the paywall — keeps the pre-payment funnel from grinding unlimited free
 * Mistral calls. Shared between the regenerate route (enforcement) and the
 * results page (computing how many are left to show/hide the UI).
 */
export const MAX_FREE_REGENERATIONS = 3;
