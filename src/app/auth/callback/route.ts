import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isNewSignup, handleNewSignup } from "@/lib/auth/handle-new-signup";

/**
 * Google OAuth callback. Supabase redirects here with a `code` query param
 * that gets exchanged for a session cookie.
 *
 * This is also the only reliable place to fire `signup_completed` for the
 * OAuth flow: the click on the login page only proves the user *started*
 * auth (`signup_started`), not that a session actually exists yet. The
 * email flow uses a 6-digit code instead (see /api/auth/verify-otp), which
 * runs the same `handleNewSignup` side effects once the code is verified.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect_to") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (isNewSignup(data.user)) {
        await handleNewSignup(request, data.user, "google");
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
