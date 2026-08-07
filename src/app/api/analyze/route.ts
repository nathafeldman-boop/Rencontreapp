import { createClient } from "@/lib/supabase/server";
import { analyzeProfile } from "@/lib/ai/analyze-profile";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { signPhotoUrls } from "@/lib/supabase/signed-photo-urls";
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

  const { data: answers } = await supabase
    .from("onboarding_answers")
    .select("question, answer")
    .eq("user_id", user.id);

  const findAnswer = (question: string) => answers?.find((a) => a.question === question)?.answer;

  const signedUrls = await signPhotoUrls(supabase, profile.photos ?? []);

  const result = await analyzeProfile({
    seed: profile.id,
    bio: profile.bio ?? "",
    datingApp: profile.dating_app,
    photos: (profile.photos ?? [])
      .filter((path) => signedUrls[path])
      .map((path) => ({ path, signedUrl: signedUrls[path] })),
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
      user_id: user.id,
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

  if (insertError) {
    return apiError(insertError.message, 500);
  }

  if (result.photoAnalyses.length > 0) {
    await supabase.from("photo_analyses").insert(
      result.photoAnalyses.map((p) => ({
        analysis_id: analysis.id,
        user_id: user.id,
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

  if (subscription) {
    await consumeCredits(supabase, user.id, "profile_analysis");
  }

  return apiSuccess({ analysis_id: analysis.id, overall_score: result.overall_score }, 201);
}
