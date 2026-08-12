import { createClient } from "@/lib/supabase/server";
import { rescoreProfile } from "@/lib/ai/rescore-profile";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { apiError, apiSuccess } from "@/lib/api/response";

export const maxDuration = 60;

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
    return apiError("Connecte-toi pour lancer une analyse.", 401);
  }

  const subscription = await getActiveSubscription(supabase);

  if (subscription) {
    const credits = await checkCredits(supabase, "profile_analysis");
    if (!credits.allowed) {
      return apiError("Tu as utilisé tous tes crédits coaching pour ce mois-ci.", 429);
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
    // Surfaced verbatim to the user via /analyze's error screen — Postgres/
    // Supabase error messages are technical and in English, but this branch
    // (a genuine DB failure) is rare enough that a generic French fallback
    // beats leaking that text, unlike the two branches below which are
    // common enough to deserve a specific, actionable French message.
    console.error("[api/analyze] profile lookup failed", profileError);
    return apiError("Une erreur est survenue — réessaie dans un instant.", 500);
  }

  if (!profile) {
    return apiError("Aucun profil trouvé — complète l'inscription et envoie tes photos d'abord.", 422);
  }

  const result = await rescoreProfile(supabase, user.id, {
    id: profile.id,
    bio: profile.bio,
    photos: profile.photos ?? [],
    dating_app: profile.dating_app,
  });

  if (!result) {
    return apiError("Impossible d'analyser ce profil — vérifie que tes photos sont bien envoyées.", 422);
  }

  if (subscription) {
    await consumeCredits(supabase, user.id, "profile_analysis");
    trackServer(user.id, AnalyticsEvent.AnalysisRepeated, { overall_score: result.overallScore });
  }

  return apiSuccess({ analysis_id: result.analysisId, overall_score: result.overallScore }, 201);
}
