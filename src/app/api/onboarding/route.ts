import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  onboardingSubmissionSchema,
  objectiveLabel,
  weeklyMatchesLabel,
  biggestProblemLabel,
} from "@/lib/validations/onboarding";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = onboardingSubmissionSchema.safeParse(json);

  if (!parsed.success) {
    // Surfaced in Vercel runtime logs — the client only shows a generic
    // "Validation failed" plus the issue list, so this is what lets us see
    // exactly which field/value tripped the schema without waiting on a
    // user screenshot with the raw payload.
    console.error("[api/onboarding] validation failed", { body: json, issues: parsed.error.issues });
    return apiValidationError(parsed.error);
  }

  const { age, gender, location, dating_app, objective, weekly_matches, biggest_problem, confidence, hobbies } =
    parsed.data;

  const { error: userError } = await supabase
    .from("users")
    .update({ age, gender, country: location, dating_apps_used: [dating_app] })
    .eq("id", user.id);

  if (userError) {
    // Raw Postgres error messages are English/technical — never shown to
    // the user verbatim (see onboarding-form.tsx's error handler, which
    // does display `body.error` directly). Log it, return a generic
    // French message instead.
    console.error("[api/onboarding] users update failed", userError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  const { error: answersError } = await supabase.from("onboarding_answers").insert([
    { user_id: user.id, question: "What's your main objective?", answer: objectiveLabel(objective) },
    {
      user_id: user.id,
      question: "How many matches do you get weekly?",
      answer: weeklyMatchesLabel(weekly_matches),
    },
    {
      user_id: user.id,
      question: "What's your biggest problem right now?",
      answer: biggestProblemLabel(biggest_problem),
    },
    { user_id: user.id, question: "How confident are you with your profile?", answer: `${confidence}/10` },
    { user_id: user.id, question: "What are your hobbies/interests?", answer: hobbies },
  ]);

  if (answersError) {
    console.error("[api/onboarding] answers insert failed", answersError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ completed: true });
}
