import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { rescoreProfile } from "@/lib/ai/rescore-profile";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";
import { MAX_FREE_REGENERATIONS } from "@/lib/ai/free-regenerations";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

export const maxDuration = 60;

const bodySchema = z.object({
  bio: z.string().max(3000, "Ta bio est trop longue (3000 caractères maximum).").optional(),
});

/**
 * Lets a user regenerate their free analysis before they've subscribed —
 * either as-is (another roll against the same bio/photos) or with an edited
 * bio — capped at MAX_FREE_REGENERATIONS per profile so this can't be used
 * to grind unlimited free Mistral calls. Subscribers already have their own
 * credit-gated re-analysis path via POST /api/analyze; this route is
 * specifically the pre-paywall free funnel, so an active subscriber is
 * pointed there instead.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const subscription = await getActiveSubscription(supabase);
  if (subscription) {
    return apiError("Tu as déjà un abonnement actif — relance ton analyse depuis ton tableau de bord.", 403);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, bio, photos, dating_app")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (profileError) {
    console.error("[api/analyze/regenerate] profile lookup failed", profileError);
    return apiError("Une erreur est survenue — réessaie dans un instant.", 500);
  }

  if (!profile) {
    return apiError("Aucun profil trouvé — complète l'inscription et envoie tes photos d'abord.", 422);
  }

  const { count, error: countError } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  if (countError) {
    console.error("[api/analyze/regenerate] count failed", countError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  // The initial analysis from onboarding already counts as one row, so the
  // first MAX_FREE_REGENERATIONS *additional* rows are what's free here.
  const regenerationsUsed = Math.max((count ?? 1) - 1, 0);
  if (regenerationsUsed >= MAX_FREE_REGENERATIONS) {
    return apiError(
      `Tu as utilisé tes ${MAX_FREE_REGENERATIONS} régénérations gratuites pour ce profil — passe à l'abonnement pour continuer à l'affiner.`,
      403
    );
  }

  const editedBio = parsed.data.bio !== undefined && parsed.data.bio !== (profile.bio ?? "");
  if (editedBio) {
    const { error: updateError } = await supabase.from("profiles").update({ bio: parsed.data.bio }).eq("id", profile.id);
    if (updateError) {
      console.error("[api/analyze/regenerate] bio update failed", updateError);
      return apiError("Une erreur est survenue — réessaie.", 500);
    }
  }

  const result = await rescoreProfile(
    supabase,
    user.id,
    {
      id: profile.id,
      bio: editedBio ? (parsed.data.bio ?? "") : profile.bio,
      photos: profile.photos ?? [],
      dating_app: profile.dating_app,
    },
    { allowSimulatedFallback: true }
  );

  if (!result) {
    return apiError("Impossible de régénérer cette analyse — vérifie que tes photos sont bien envoyées.", 422);
  }

  const regenerationsRemaining = MAX_FREE_REGENERATIONS - (regenerationsUsed + 1);
  trackServer(user.id, AnalyticsEvent.FreeRegenerationUsed, {
    mode: editedBio ? "edited_bio" : "same",
    overall_score: result.overallScore,
    regenerations_remaining: regenerationsRemaining,
  });

  return apiSuccess(
    { analysis_id: result.analysisId, overall_score: result.overallScore, regenerations_remaining: regenerationsRemaining },
    201
  );
}
