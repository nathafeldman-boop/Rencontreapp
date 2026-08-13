import type { DatingApp } from "@/types/database.types";

/**
 * Every major app pairs a short bio with optional prompt/answer cards —
 * except Hinge, which replaces the bio entirely with 3 required prompts.
 * See migration 0013 for `profiles.prompts`. Kept in its own module (not
 * under lib/ai/) since `flattenPromptsToBio` is used by the plain PATCH
 * /api/profile route, not just AI code.
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

/** Tinder's "Fun Facts" prompt cards — shown alongside the free-text bio, not instead of it. */
export const TINDER_FUN_FACT_OPTIONS = [
  "Le pire cadeau que j'ai reçu…",
  "Ma playlist secrète et un peu honteuse…",
  "Un talent inutile que je maîtrise parfaitement…",
  "Ce qui me fait rire à tous les coups…",
  "Mon snack de 3h du matin…",
  "La dernière série que j'ai finie en une nuit…",
  "Un truc que je ferais si je n'avais pas peur du ridicule…",
  "Ma théorie du complot préférée (même fausse)…",
  "Le plat que je cuisine le mieux…",
  "Un souvenir d'enfance qui me résume bien…",
  "Ce que mes amis disent de moi derrière mon dos…",
  "Mon petit plaisir coupable…",
] as const;

/** Bumble's "Teasers" prompt cards — shown alongside the free-text description, not instead of it. */
export const BUMBLE_TEASER_OPTIONS = [
  "Tranche le débat : …",
  "On va bien s'entendre si…",
  "Le meilleur conseil qu'on m'ait donné…",
  "Une chose que je fais toujours en premier au réveil…",
  "Mon rencard parfait, sans filtre…",
  "Ce qu'on me demande souvent…",
  "Un fait sur moi qui surprend les gens…",
  "Ma pire excuse pour annuler un rendez-vous…",
  "La chanson que je mets à fond dans ma voiture…",
  "Deux vérités et un mensonge…",
] as const;

export interface SecondaryPromptFormat {
  /** How this app calls the feature, for UI copy — "Accroches", "Fun Facts", "Teasers". */
  label: string;
  optionsBank: readonly string[];
  /** Exact count for Hinge (required); a soft target for Tinder/Bumble (optional, "at least one"). */
  count: number;
  /** Hinge only: prompts fully replace the free-text bio instead of sitting alongside it. */
  replacesBio: boolean;
  helperText: string;
}

export const SECONDARY_PROMPT_FORMATS: Partial<Record<DatingApp, SecondaryPromptFormat>> = {
  hinge: {
    label: "Accroches",
    optionsBank: HINGE_PROMPT_OPTIONS,
    count: 3,
    replacesBio: true,
    helperText: "3 mini-réponses au lieu d'une bio unique — le format utilisé par Hinge.",
  },
  tinder: {
    label: "Fun Facts",
    optionsBank: TINDER_FUN_FACT_OPTIONS,
    count: 2,
    replacesBio: false,
    helperText: "Des anecdotes courtes en plus de ta bio — le format \"Fun Facts\" de Tinder.",
  },
  bumble: {
    label: "Teasers",
    optionsBank: BUMBLE_TEASER_OPTIONS,
    count: 3,
    replacesBio: false,
    helperText: "Des mini-accroches en plus de ta description — le format \"Teasers\" de Bumble.",
  },
};

/**
 * Flattens prompt/answer pairs into a single bio-shaped string — used only
 * for Hinge, where prompts fully replace the bio (see PATCH /api/profile).
 */
export function flattenPromptsToBio(prompts: ProfilePrompt[]): string {
  return prompts.map((p) => `${p.prompt}\n${p.answer}`).join("\n\n");
}
