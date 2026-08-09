/**
 * Hinge-style prompt/answer bio format — see migration 0013. Tinder and
 * Bumble use one free-text bio; Hinge replaces that with 3 short
 * prompt+answer cards instead. Kept in its own module (not under lib/ai/)
 * since `flattenPromptsToBio` is used by the plain PATCH /api/profile
 * route, not just AI code.
 */
export interface ProfilePrompt {
  prompt: string;
  answer: string;
}

/** Real, commonly-used Hinge prompts, in French. Mistral picks from these when generating answers (see lib/ai/generate-bios.ts). */
export const HINGE_PROMPT_OPTIONS = [
  "Une chose bête sur laquelle je suis toujours partant(e)…",
  "Mon rencard idéal…",
  "Deux vérités et un mensonge…",
  "Le chemin vers mon cœur passe par…",
  "Je m'engage à fond quand il s'agit de…",
  "Un fait peu connu sur moi…",
  "On va bien s'entendre si…",
  "Ma pire habitude…",
  "Ce dont je suis le plus fier(e)…",
  "Un débat que j'adore avoir…",
  "Je cherche quelqu'un qui…",
  "Ma green flag…",
  "Le meilleur conseil que j'ai reçu…",
  "Une journée parfaite ressemblerait à…",
  "Je suis plutôt du genre à…",
] as const;

/**
 * Flattens prompt/answer pairs into a single bio-shaped string so every
 * other part of the app (Mistral scoring, conversation-coach context,
 * the profile display fallback) keeps working against `profiles.bio`
 * without needing to know prompts exist.
 */
export function flattenPromptsToBio(prompts: ProfilePrompt[]): string {
  return prompts.map((p) => `${p.prompt}\n${p.answer}`).join("\n\n");
}
