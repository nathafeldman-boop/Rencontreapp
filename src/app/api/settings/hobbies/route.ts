import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_QUESTIONS } from "@/lib/ai/user-context";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const bodySchema = z.object({
  hobbies: z.string().min(1, "Dis-nous en un peu plus sur toi.").max(300, "300 caractères maximum."),
});

/**
 * Upserts the "hobbies/interests" onboarding answer — lets a user who
 * signed up before that onboarding step existed fill it in retroactively,
 * so the AI tools (bio generator especially) ground their output in real
 * facts instead of inventing/extending fictional ones from a placeholder
 * bio.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { data: existing } = await supabase
    .from("onboarding_answers")
    .select("id")
    .eq("user_id", user.id)
    .eq("question", ONBOARDING_QUESTIONS.hobbies)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("onboarding_answers").update({ answer: parsed.data.hobbies }).eq("id", existing.id)
    : await supabase
        .from("onboarding_answers")
        .insert({ user_id: user.id, question: ONBOARDING_QUESTIONS.hobbies, answer: parsed.data.hobbies });

  if (error) {
    console.error("[api/settings/hobbies] write failed", error);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ updated: true });
}
