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

  const questions = [
    "What's your main objective?",
    "How many matches do you get weekly?",
    "What's your biggest problem right now?",
    "How confident are you with your profile?",
    "What are your hobbies/interests?",
  ];

  // Upsert, not insert: this route can now be replayed on purpose (a full
  // "restart onboarding" from the free regenerate panel — see
  // /onboarding?restart=1), and a blind insert would leave stale duplicate
  // rows behind for these 5 questions, which several read paths assume are
  // unique per (user_id, question) — e.g. results/page.tsx's `.maybeSingle()`
  // lookup for "biggest problem" would start erroring instead of just
  // picking one. Clearing and re-inserting is simpler than a per-row
  // select-then-update loop and gives identical end state.
  const { error: deleteError } = await supabase
    .from("onboarding_answers")
    .delete()
    .eq("user_id", user.id)
    .in("question", questions);

  if (deleteError) {
    console.error("[api/onboarding] answers cleanup failed", deleteError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  const { error: answersError } = await supabase.from("onboarding_answers").insert([
    { user_id: user.id, question: questions[0], answer: objectiveLabel(objective) },
    { user_id: user.id, question: questions[1], answer: weeklyMatchesLabel(weekly_matches) },
    { user_id: user.id, question: questions[2], answer: biggestProblemLabel(biggest_problem) },
    { user_id: user.id, question: questions[3], answer: `${confidence}/10` },
    { user_id: user.id, question: questions[4], answer: hobbies },
  ]);

  if (answersError) {
    console.error("[api/onboarding] answers insert failed", answersError);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ completed: true });
}
