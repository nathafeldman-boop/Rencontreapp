import { createClient } from "@/lib/supabase/server";
import { simulateAnalysis } from "@/lib/ai/simulate-analysis";
import { apiError, apiSuccess } from "@/lib/api/response";

/**
 * MVP version: scores come from `simulateAnalysis` (see
 * src/lib/ai/simulate-analysis.ts), not a real Mistral call yet. The
 * response shape and the `analyses` row it writes are the same contract
 * the real pipeline will use, so swapping the scoring function later is a
 * one-file change — this route, `/analyze`, and `/results` don't move.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
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

  const result = simulateAnalysis({
    seed: profile.id,
    bio: profile.bio ?? "",
    photoCount: profile.photos?.length ?? 0,
    datingApp: profile.dating_app,
  });

  const { data: analysis, error: insertError } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      profile_id: profile.id,
      overall_score: result.overall_score,
      photo_score: result.photo_score,
      bio_score: result.bio_score,
      attractiveness_score: result.attractiveness_score,
      conversation_score: result.conversation_score,
      free_insights: result.free_insights,
      recommendations: result.recommendations,
      is_simulated: true,
    })
    .select("id")
    .single();

  if (insertError) {
    return apiError(insertError.message, 500);
  }

  return apiSuccess({ analysis_id: analysis.id, overall_score: result.overall_score }, 201);
}
