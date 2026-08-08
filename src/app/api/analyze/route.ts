import { createClient } from "@/lib/supabase/server";
import { rescoreProfile } from "@/lib/ai/rescore-profile";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { apiError, apiSuccess } from "@/lib/api/response";

/**
 * Scores come from `analyzeProfile` (src/lib/ai/analyze-profile.ts), which
 * calls Mistral's vision model and falls back to the deterministic
 * simulation on any failure. Free users get one analysis as part of the
 * signup funnel at no credit cost; returning premium users (active
 * subscription) spend AI credits to re-run it from the dashboard.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const subscription = await getActiveSubscription(supabase);

  if (subscription) {
    const credits = await checkCredits(supabase, "profile_analysis");
    if (!credits.allowed) {
      return apiError("You've used all your AI credits for this month.", 429);
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, bio, photos, dating_app")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (profileError) {
    return apiError(profileError.message, 500);
  }

  if (!profile) {
    return apiError("No profile found — complete onboarding and upload your photos first.", 422);
  }

  const result = await rescoreProfile(supabase, user.id, {
    id: profile.id,
    bio: profile.bio,
    photos: profile.photos ?? [],
    dating_app: profile.dating_app,
  });

  if (!result) {
    return apiError("Unable to analyze this profile — check that photos are uploaded.", 422);
  }

  if (subscription) {
    await consumeCredits(supabase, user.id, "profile_analysis");
    trackServer(user.id, AnalyticsEvent.AnalysisRepeated, { overall_score: result.overallScore });
  }

  return apiSuccess({ analysis_id: result.analysisId, overall_score: result.overallScore }, 201);
}
