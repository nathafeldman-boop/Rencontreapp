import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { attributeReferralSignup } from "@/lib/referrals/attribute-signup";

/**
 * OAuth (Google) and email-magic-link callback. Supabase redirects here
 * with a `code` query param that gets exchanged for a session cookie.
 *
 * This is also the only reliable place to fire `signup_completed`: the
 * click on the login page only proves the user *started* auth
 * (`signup_started`), not that a session actually exists yet.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect_to") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user } = data;
      const method = user.app_metadata?.provider === "google" ? "google" : "email";

      // Heuristic for "this account was just created" vs. "an existing user
      // logged back in through the same magic-link/OAuth flow": on a brand
      // new account, `created_at` and `last_sign_in_at` land within the same
      // request; on a returning login they're far apart.
      const isNewSignup =
        !!user.last_sign_in_at &&
        !!user.created_at &&
        Math.abs(new Date(user.last_sign_in_at).getTime() - new Date(user.created_at).getTime()) < 5000;

      if (isNewSignup) {
        const attribution = await attributeReferralSignup(request, user.id);
        trackServer(user.id, AnalyticsEvent.SignupCompleted, {
          method,
          referral_code: attribution?.referralCode,
          creator_slug: attribution?.creatorSlug,
        });
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
