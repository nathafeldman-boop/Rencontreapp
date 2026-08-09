import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export interface UserContext {
  gender: string | null;
  country: string | null;
  datingApp: string | null;
  objective?: string;
  weeklyMatches?: string;
  biggestProblem?: string;
  confidence?: string;
  hobbies?: string;
  latestScores?: {
    overall: number;
    photo: number;
    bio: number;
    attractiveness: number;
    conversation: number;
  };
}

export const ONBOARDING_QUESTIONS = {
  objective: "What's your main objective?",
  weeklyMatches: "How many matches do you get weekly?",
  biggestProblem: "What's your biggest problem right now?",
  confidence: "How confident are you with your profile?",
  hobbies: "What are your hobbies/interests?",
} as const;

/**
 * Display-only French labels for the values above — the English strings
 * themselves stay as-is, they're the actual stored `question` value in
 * `onboarding_answers` and are matched against verbatim all over this
 * file, `rescore-profile.ts`, and `api/onboarding/route.ts`. Renaming
 * those would mean migrating every existing row. This map exists purely
 * so admin screens can show a French label instead of the raw English key.
 */
export const ONBOARDING_QUESTION_LABELS_FR: Record<string, string> = {
  [ONBOARDING_QUESTIONS.objective]: "Objectif principal",
  [ONBOARDING_QUESTIONS.weeklyMatches]: "Matchs par semaine",
  [ONBOARDING_QUESTIONS.biggestProblem]: "Plus gros problème actuel",
  [ONBOARDING_QUESTIONS.confidence]: "Confiance dans son profil",
  [ONBOARDING_QUESTIONS.hobbies]: "Hobbys / centres d'intérêt",
};

/**
 * Single place that assembles "what does Flirtcraft already know about this
 * user" — onboarding answers, profile, and latest scores. Every AI tool
 * (bio generator, conversation coach, match simulator, dating plan,
 * profile analysis) should build its prompt from this instead of each
 * re-querying `onboarding_answers` with its own ad-hoc `findAnswer`, so a
 * recommendation from any tool reflects the same "coach who remembers you"
 * picture of the user.
 */
export async function getUserContext(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserContext> {
  const [{ data: user }, { data: answers }, { data: profile }, { data: latestAnalysis }] = await Promise.all([
    supabase.from("users").select("gender, country").eq("id", userId).maybeSingle(),
    supabase.from("onboarding_answers").select("question, answer").eq("user_id", userId),
    supabase
      .from("profiles")
      .select("dating_app")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("analyses")
      .select("overall_score, photo_score, bio_score, attractiveness_score, conversation_score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const findAnswer = (question: string) => answers?.find((a) => a.question === question)?.answer;

  return {
    gender: user?.gender ?? null,
    country: user?.country ?? null,
    datingApp: profile?.dating_app ?? null,
    objective: findAnswer(ONBOARDING_QUESTIONS.objective),
    weeklyMatches: findAnswer(ONBOARDING_QUESTIONS.weeklyMatches),
    biggestProblem: findAnswer(ONBOARDING_QUESTIONS.biggestProblem),
    confidence: findAnswer(ONBOARDING_QUESTIONS.confidence),
    hobbies: findAnswer(ONBOARDING_QUESTIONS.hobbies),
    latestScores: latestAnalysis
      ? {
          overall: latestAnalysis.overall_score,
          photo: latestAnalysis.photo_score ?? 0,
          bio: latestAnalysis.bio_score ?? 0,
          attractiveness: latestAnalysis.attractiveness_score ?? 0,
          conversation: latestAnalysis.conversation_score ?? 0,
        }
      : undefined,
  };
}

/** Renders a UserContext as a short text block to drop into any Mistral system/user prompt. */
export function summarizeUserContext(ctx: UserContext): string {
  const lines: string[] = [];

  if (ctx.datingApp) lines.push(`Dating app: ${ctx.datingApp}`);
  if (ctx.hobbies) lines.push(`Hobbies/interests: ${ctx.hobbies}`);
  if (ctx.objective) lines.push(`Main objective: ${ctx.objective}`);
  if (ctx.biggestProblem) lines.push(`Self-reported biggest problem: ${ctx.biggestProblem}`);
  if (ctx.weeklyMatches) lines.push(`Current weekly matches: ${ctx.weeklyMatches}`);
  if (ctx.confidence) lines.push(`Self-rated profile confidence: ${ctx.confidence}`);

  if (ctx.latestScores) {
    const { overall, ...subs } = ctx.latestScores;
    const weakest = Object.entries(subs).sort((a, b) => a[1] - b[1])[0];
    lines.push(`Latest overall score: ${overall}/100, weakest area: ${weakest[0]} (${weakest[1]}/100)`);
  }

  return lines.length > 0 ? lines.join("\n") : "No profile context available yet.";
}
