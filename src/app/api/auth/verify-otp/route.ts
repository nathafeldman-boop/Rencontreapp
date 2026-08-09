import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { isNewSignup, handleNewSignup } from "@/lib/auth/handle-new-signup";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";

const bodySchema = z.object({
  email: z.string().email(),
  // Supabase's actual generated code has run 8 digits in prod, not the 6
  // Supabase's own docs describe — accept 6-8 rather than hard-reject
  // whatever length it decides to send.
  token: z.string().min(6).max(8),
  redirectTo: z.string().optional(),
});

/**
 * Verifies the code sent by `signInWithOtp` and establishes the session
 * server-side (so the cookie lands correctly), then runs the same
 * new-signup side effects as the Google OAuth callback.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { email, token, redirectTo } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error || !data.user) {
    return apiError("Code invalide ou expiré — réessaie.", 400);
  }

  if (isNewSignup(data.user)) {
    await handleNewSignup(request, data.user, "email");
  } else {
    trackServer(data.user.id, AnalyticsEvent.LoggedIn, { method: "email" });
  }

  return apiSuccess({ redirectTo: redirectTo ?? "/onboarding" });
}
