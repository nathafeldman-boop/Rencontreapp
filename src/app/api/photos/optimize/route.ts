import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { PhotoSuggestedRole } from "@/types/database.types";

const ROLE_ORDER: Record<PhotoSuggestedRole, number> = { primary: 0, secondary: 1, remove: 2 };

/**
 * Reorders (never deletes) the user's profile photos based on the latest
 * analysis's per-photo `suggested_role` + `score` — the "Build my best
 * profile" action on the Photo Optimizer page.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, photos")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return apiError("No profile found.", 422);
  }

  const { data: latestAnalysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestAnalysis) {
    return apiError("No analysis found for this profile yet.", 422);
  }

  const { data: photoAnalyses, error: fetchError } = await supabase
    .from("photo_analyses")
    .select("photo_path, score, suggested_role")
    .eq("analysis_id", latestAnalysis.id);

  if (fetchError) {
    return apiError(fetchError.message, 500);
  }

  if (!photoAnalyses || photoAnalyses.length === 0) {
    return apiError("No photo scores to optimize from yet.", 422);
  }

  const scoredPaths = new Set(photoAnalyses.map((p) => p.photo_path));
  const orderedPaths = [...photoAnalyses]
    .sort((a, b) => ROLE_ORDER[a.suggested_role] - ROLE_ORDER[b.suggested_role] || b.score - a.score)
    .map((p) => p.photo_path)
    // Any photo uploaded after this analysis ran (no score yet) stays appended, never dropped.
    .concat((profile.photos ?? []).filter((path) => !scoredPaths.has(path)));

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ photos: orderedPaths })
    .eq("id", profile.id);

  if (updateError) {
    return apiError(updateError.message, 500);
  }

  return apiSuccess({ photos: orderedPaths });
}
