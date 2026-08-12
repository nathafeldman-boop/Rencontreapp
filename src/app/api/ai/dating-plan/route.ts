import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { generateDatingPlan } from "@/lib/ai/generate-plan";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { getUserContext } from "@/lib/ai/user-context";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

/** Generates (or regenerates) the user's single active 7-day plan from their latest analysis. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const credits = await checkCredits(supabase, "dating_plan");
  if (!credits.allowed) {
    return apiError("Tu as utilisé tous tes crédits coaching pour ce mois-ci.", 429);
  }

  const { data: latest } = await supabase
    .from("analyses")
    .select("photo_score, bio_score, attractiveness_score, conversation_score, recommendations")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) {
    return apiError("Lance d'abord une analyse de profil.", 422);
  }

  const context = await getUserContext(supabase, user.id);

  const { days, isSimulated } = await generateDatingPlan({
    scores: {
      photo: latest.photo_score ?? 0,
      bio: latest.bio_score ?? 0,
      attractiveness: latest.attractiveness_score ?? 0,
      conversation: latest.conversation_score ?? 0,
    },
    recommendations: latest.recommendations ?? [],
    biggestProblem: context.biggestProblem,
    objective: context.objective,
  });

  const { error } = await supabase.from("dating_plans").upsert(
    { user_id: user.id, days },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[api/ai/dating-plan POST] upsert failed", error);
    return apiError("Une erreur est survenue — réessaie.", 500);
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
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = toggleSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { data: plan } = await supabase.from("dating_plans").select("days").eq("user_id", user.id).maybeSingle();

  if (!plan) {
    return apiError("Aucun plan trouvé — génère-en un d'abord.", 422);
  }

  const days = plan.days.map((d) => (d.day === parsed.data.day ? { ...d, done: parsed.data.done } : d));

  const { error } = await supabase.from("dating_plans").update({ days }).eq("user_id", user.id);

  if (error) {
    console.error("[api/ai/dating-plan PATCH] update failed", error);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ days });
}
