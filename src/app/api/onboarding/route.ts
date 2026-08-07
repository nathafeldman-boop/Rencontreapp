import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { onboardingSubmissionSchema } from "@/lib/validations/onboarding";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = onboardingSubmissionSchema.safeParse(json);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { age, gender, country, dating_apps_used, dating_goal, answers } = parsed.data;

  const { error: userError } = await supabase
    .from("users")
    .update({ age, gender, country, dating_apps_used, dating_goal })
    .eq("id", user.id);

  if (userError) {
    return apiError(userError.message, 500);
  }

  if (answers.length > 0) {
    const { error: answersError } = await supabase.from("onboarding_answers").insert(
      answers.map((a) => ({ user_id: user.id, question: a.question, answer: a.answer }))
    );

    if (answersError) {
      return apiError(answersError.message, 500);
    }
  }

  return apiSuccess({ completed: true });
}
