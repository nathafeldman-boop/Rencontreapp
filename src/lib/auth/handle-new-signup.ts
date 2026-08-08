import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { attributeReferralSignup } from "@/lib/referrals/attribute-signup";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { sendWelcomeEmail } from "@/lib/email/send";

/**
 * Heuristic for "this account was just created" vs. "an existing user
 * logged back in through the same magic-link/OTP/OAuth flow": on a brand
 * new account, `created_at` and `last_sign_in_at` land within the same
 * request; on a returning login they're far apart.
 */
export function isNewSignup(user: User): boolean {
  return (
    !!user.last_sign_in_at &&
    !!user.created_at &&
    Math.abs(new Date(user.last_sign_in_at).getTime() - new Date(user.created_at).getTime()) < 5000
  );
}

/**
 * Runs once, right after a brand-new session is confirmed to belong to a
 * first-time signup — shared by both the Google OAuth callback and the
 * email OTP verification route so referral attribution, analytics, and the
 * welcome email only ever live in one place.
 */
export async function handleNewSignup(request: NextRequest, user: User, method: "google" | "email") {
  const attribution = await attributeReferralSignup(request, user.id);
  trackServer(user.id, AnalyticsEvent.SignupCompleted, {
    method,
    referral_code: attribution?.referralCode,
    creator_slug: attribution?.creatorSlug,
  });
  if (user.email) await sendWelcomeEmail(user.email);
}
