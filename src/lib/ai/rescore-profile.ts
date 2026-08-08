import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { analyzeProfile } from "@/lib/ai/analyze-profile";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";

export interface RescoreResult {
  analysisId: string;
  overallScore: number;
  photoScore: number;
  bioScore: number;
  attractivenessScore: number;
  conversationScore: number;
  isSimulated: boolean;
}

/**
 * Re-runs the same Mistral profile analysis used for the initial /analyze
 * flow against a profile's *current* bio/photos and inserts a fresh
 * `analyses` (+ `photo_analyses`) row. Called whenever the user edits their
 * bio or photos from the dashboard so the score reflects the change right
 * away instead of staying frozen at whatever the very first analysis said.
 */
export async function rescoreProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: { id: string; bio: string | null; photos: string[]; dating_app: string }
): Promise<RescoreResult | null> {
  if (!profile.photos || profile.photos.length === 0) return null;

  const { data: answers } = await supabase
    .from("onboarding_answers")
    .select("question, answer")
    .eq("user_id", userId);

  const findAnswer = (question: string) => answers?.find((a) => a.question === question)?.answer;

  const signedUrls = await signPhotoUrls(supabase, profile.photos);
  const photos = profile.photos.filter((path) => signedUrls[path]).map((path) => ({ path, signedUrl: signedUrls[path] }));

  if (photos.length === 0) return null;

  const result = await analyzeProfile({
    seed: profile.id,
    bio: profile.bio ?? "",
    datingApp: profile.dating_app,
    photos,
    onboarding: {
      objective: findAnswer("What's your main objective?"),
      weeklyMatches: findAnswer("How many matches do you get weekly?"),
      biggestProblem: findAnswer("What's your biggest problem right now?"),
      confidence: findAnswer("How confident are you with your profile?"),
    },
  });

  const { data: analysis, error: insertError } = await supabase
    .from("analyses")
    .insert({
      user_id: userId,
      profile_id: profile.id,
      overall_score: result.overall_score,
      photo_score: result.photo_score,
      bio_score: result.bio_score,
      attractiveness_score: result.attractiveness_score,
      conversation_score: result.conversation_score,
      free_insights: result.free_insights,
      recommendations: result.recommendations,
      is_simulated: result.isSimulated,
    })
    .select("id")
    .single();

  if (insertError || !analysis) return null;

  if (result.photoAnalyses.length > 0) {
    await supabase.from("photo_analyses").insert(
      result.photoAnalyses.map((p) => ({
        analysis_id: analysis.id,
        user_id: userId,
        photo_path: p.photo_path,
        position: p.position,
        score: p.score,
        confidence_score: p.confidence_score,
        attractiveness_score: p.attractiveness_score,
        technical_score: p.technical_score,
        pros: p.pros,
        cons: p.cons,
        recommendation: p.recommendation,
        suggested_role: p.suggested_role,
      }))
    );
  }

  return {
    analysisId: analysis.id,
    overallScore: result.overall_score,
    photoScore: result.photo_score,
    bioScore: result.bio_score,
    attractivenessScore: result.attractiveness_score,
    conversationScore: result.conversation_score,
    isSimulated: result.isSimulated,
  };
}
