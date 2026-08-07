import { z } from "zod";

export const OBJECTIVE_OPTIONS = [
  { value: "more_matches", label: "More matches" },
  { value: "more_dates", label: "More dates" },
  { value: "better_conversations", label: "Better conversations" },
  { value: "serious_relationship", label: "Serious relationship" },
] as const;

export const WEEKLY_MATCHES_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1-5", label: "1-5" },
  { value: "5-20", label: "5-20" },
  { value: "20+", label: "20+" },
] as const;

export const BIGGEST_PROBLEM_OPTIONS = [
  { value: "no_matches", label: "No matches" },
  { value: "no_replies", label: "Matches don't reply" },
  { value: "bad_profile", label: "Bad profile" },
  { value: "bad_conversations", label: "Bad conversations" },
] as const;

const objectiveValues = OBJECTIVE_OPTIONS.map((o) => o.value) as [string, ...string[]];
const weeklyMatchesValues = WEEKLY_MATCHES_OPTIONS.map((o) => o.value) as [string, ...string[]];
const biggestProblemValues = BIGGEST_PROBLEM_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const onboardingSubmissionSchema = z.object({
  // Step 1 — "Let's personalize your analysis"
  age: z.number().int().min(18).max(100),
  gender: z.enum(["male", "female", "non_binary", "other"]),
  location: z.string().min(1).max(100),

  // Step 2 — dating app
  dating_app: z.enum(["tinder", "hinge", "bumble", "other"]),

  // Step 3 — objective
  objective: z.enum(objectiveValues),

  // Step 4 — current weekly matches
  weekly_matches: z.enum(weeklyMatchesValues),

  // Step 5 — biggest problem
  biggest_problem: z.enum(biggestProblemValues),

  // Step 6 — confidence slider
  confidence: z.number().int().min(1).max(10),
});

export type OnboardingSubmission = z.infer<typeof onboardingSubmissionSchema>;

export function objectiveLabel(value: string) {
  return OBJECTIVE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function weeklyMatchesLabel(value: string) {
  return WEEKLY_MATCHES_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function biggestProblemLabel(value: string) {
  return BIGGEST_PROBLEM_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
