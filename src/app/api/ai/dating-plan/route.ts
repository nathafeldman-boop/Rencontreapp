import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { generateDatingPlan } from "@/lib/ai/generate-plan";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

/** Generates (or regenerates) the user's single active 7-day plan from their latest analysis. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const credits = await checkCredits(supabase, "dating_plan");
  if (!credits.allowed) {
    return apiError("You've used all your AI credits for this month.", 429);
  }

  const { data: latest } = await supabase
    .from("analyses")
    .select("photo_score, bio_score, attractiveness_score, conversation_score, recommendations")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) {
    return apiError("Run a profile analysis first.", 422);
  }

  const { data: answers } = await supabase
    .from("onboarding_answers")
    .select("answer")
    .eq("user_id", user.id)
    .eq("question", "What's your biggest problem right now?")
    .maybeSingle();

  const { days, isSimulated } = await generateDatingPlan({
    scores: {
      photo: latest.photo_score ?? 0,
      bio: latest.bio_score ?? 0,
      attractiveness: latest.attractiveness_score ?? 0,
      conversation: latest.conversation_score ?? 0,
    },
    recommendations: latest.recommendations ?? [],
    biggestProblem: answers?.answer,
  });

  const { error } = await supabase.from("dating_plans").upsert(
    { user_id: user.id, days },
    { onConflict: "user_id" }
  );

  if (error) {
    return apiError(error.message, 500);
  }

  await consumeCredits(supabase, user.id, "dating_plan");

  return apiSuccess({ days, isSimulated });
}

const toggleSchema = z.object({ day: z.number().int().min(1).max(7), done: z.boolean() });

/** Marks a single day done/undone. */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = toggleSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { data: plan } = await supabase.from("dating_plans").select("days").eq("user_id", user.id).maybeSingle();

  if (!plan) {
    return apiError("No plan found — generate one first.", 422);
  }

  const days = plan.days.map((d) => (d.day === parsed.data.day ? { ...d, done: parsed.data.done } : d));

  const { error } = await supabase.from("dating_plans").update({ days }).eq("user_id", user.id);

  if (error) {
    return apiError(error.message, 500);
  }

  return apiSuccess({ days });
}
