import { createClient } from "@/lib/supabase/server";
import { generatePromptAnswers } from "@/lib/ai/generate-bios";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { getUserContext, summarizeUserContext } from "@/lib/ai/user-context";
import { apiError, apiSuccess } from "@/lib/api/response";

/** Hinge-specific sibling of /api/ai/bio-generator: 3 prompt+answer cards instead of a free-text bio. Same credit cost/feature ("bio_generator") — it's the same product action, just a different output shape. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const credits = await checkCredits(supabase, "bio_generator");
  if (!credits.allowed) {
    return apiError("Tu as utilisé tous tes crédits coaching pour ce mois-ci.", 429);
  }

  const [{ data: profile }, context] = await Promise.all([
    supabase
      .from("profiles")
      .select("bio, dating_app")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getUserContext(supabase, user.id),
  ]);

  const { answers, isSimulated } = await generatePromptAnswers({
    sourceBio: profile?.bio ?? "",
    datingApp: profile?.dating_app ?? "hinge",
    contextSummary: summarizeUserContext(context),
  });

  await consumeCredits(supabase, user.id, "bio_generator");

  return apiSuccess({ answers, isSimulated });
}
