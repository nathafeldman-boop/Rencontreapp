import { z } from "zod";

export const OBJECTIVE_OPTIONS = [
  { value: "more_matches", label: "Plus de matchs" },
  { value: "more_dates", label: "Plus de rendez-vous" },
  { value: "better_conversations", label: "De meilleures conversations" },
  { value: "serious_relationship", label: "Une relation sérieuse" },
] as const;

export const WEEKLY_MATCHES_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1-5", label: "1-5" },
  { value: "5-20", label: "5-20" },
  { value: "20+", label: "20+" },
] as const;

export const BIGGEST_PROBLEM_OPTIONS = [
  { value: "no_matches", label: "Aucun match" },
  { value: "no_replies", label: "Les matchs ne répondent pas" },
  { value: "bad_profile", label: "Mauvais profil" },
  { value: "bad_conversations", label: "Mauvaises conversations" },
] as const;

const objectiveValues = OBJECTIVE_OPTIONS.map((o) => o.value) as [string, ...string[]];
const weeklyMatchesValues = WEEKLY_MATCHES_OPTIONS.map((o) => o.value) as [string, ...string[]];
const biggestProblemValues = BIGGEST_PROBLEM_OPTIONS.map((o) => o.value) as [string, ...string[]];

// Custom French messages throughout — these can reach the user verbatim
// (see onboarding-form.tsx's error handling around each step submit),
// and Zod's default messages are English/technical, not something to
// show a French-only product's users.
export const onboardingSubmissionSchema = z.object({
  // Step 1 — "Let's personalize your analysis"
  age: z.number("Indique ton âge.").int().min(18, "Tu dois avoir au moins 18 ans.").max(100, "Âge invalide."),
  gender: z.enum(["male", "female", "non_binary", "other"], "Choisis un genre."),
  location: z.string().min(1, "Indique ta localisation.").max(100, "Localisation trop longue."),

  // Step 2 — dating app
  dating_app: z.enum(["tinder", "hinge", "bumble", "other"], "Choisis une application de rencontre."),

  // Step 3 — objective
  objective: z.enum(objectiveValues, "Choisis un objectif."),

  // Step 4 — current weekly matches
  weekly_matches: z.enum(weeklyMatchesValues, "Choisis une réponse."),

  // Step 5 — biggest problem
  biggest_problem: z.enum(biggestProblemValues, "Choisis une réponse."),

  // Step 6 — confidence slider
  confidence: z.number().int().min(1).max(10),

  // Step 7 — hobbies/lifestyle, so the AI tools can personalize beyond dating-app mechanics
  hobbies: z.string().min(1, "Dis-nous en un peu plus sur toi.").max(300, "300 caractères maximum."),
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
