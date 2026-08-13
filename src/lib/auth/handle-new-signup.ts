import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { attributeReferralSignup } from "@/lib/referrals/attribute-signup";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { LANDING_REFERRER_COOKIE, LANDING_UTM_COOKIE, ANON_ID_COOKIE } from "@/lib/analytics/cookies";
import { sendWelcomeEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Heuristic for "this account was just created" vs. "an existing user
 * logged back in through the same magic-link/OTP/OAuth flow": on a brand
 * new account, `created_at` and `last_sign_in_at` land close together; on a
 * returning login they're far apart.
 *
 * Was 5 seconds, which only fits Google OAuth's near-instant round trip.
 * For email OTP, `auth.users` (and the `public.users` row a DB trigger
 * creates from it — see migration 0001) is created the moment
 * `signInWithOtp` is called, but `last_sign_in_at` isn't set until the user
 * actually types the code in from their inbox — routinely 10-60+ seconds
 * later for a real human, sometimes several minutes. Confirmed in prod: a
 * genuine first-time signup with a 32s gap was silently misclassified as a
 * returning login, which skipped referral/affiliate attribution, the
 * welcome email, claiming pre-signup landing events, and the
 * `signup_completed` event the admin dashboard's "nouveaux inscrits" count
 * depends on — most signups to date were undercounted this way (3
 * `signup_completed` events recorded against 11 real users). 10 minutes
 * comfortably covers slow OTP entry while staying far short of any
 * realistic gap before a genuine next login.
 */
const NEW_SIGNUP_WINDOW_MS = 10 * 60 * 1000;

export function isNewSignup(user: User): boolean {
  return (
    !!user.last_sign_in_at &&
    !!user.created_at &&
    Math.abs(new Date(user.last_sign_in_at).getTime() - new Date(user.created_at).getTime()) < NEW_SIGNUP_WINDOW_MS
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
    affiliate_code: attribution?.affiliateCode,
  });

  // First-touch marketing attribution (see assign-landing-source-cookie.ts)
  // — written once, here, since this only ever runs on the actual signup.
  const signupReferrer = request.cookies.get(LANDING_REFERRER_COOKIE)?.value ?? null;
  const signupUtmSource = request.cookies.get(LANDING_UTM_COOKIE)?.value ?? null;
  if (signupReferrer || signupUtmSource) {
    await createAdminClient()
      .from("users")
      .update({ signup_referrer: signupReferrer, signup_utm_source: signupUtmSource })
      .eq("id", user.id);
  }

  // Claim every pre-signup event (landing view, click-to-start, ...) fired
  // under this browser's anonymous id — so the admin timeline shows the
  // landing page visit as the first event, not just "compte créé".
  const anonId = request.cookies.get(ANON_ID_COOKIE)?.value;
  if (anonId) {
    await createAdminClient()
      .from("activity_events")
      .update({ user_id: user.id, anon_id: null })
      .eq("anon_id", anonId);
  }

  if (user.email) await sendWelcomeEmail(user.email);
}
