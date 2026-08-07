export type LandingVariant = "v1" | "v2" | "v3";

export const LANDING_VARIANTS: LandingVariant[] = ["v1", "v2", "v3"];
export const DEFAULT_VARIANT: LandingVariant = "v1";
export const VARIANT_COOKIE = "mai_variant";

export interface LandingCopy {
  badge: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineAfter: string;
  subheadline: string;
  ctaLabel: string;
}

/**
 * The one file to edit to test a new landing headline/CTA/copy — no
 * component changes needed. `Hero` and `FinalCta` just read from here by
 * variant key, and the variant is attached to `landing_view` /
 * `click_start_analysis` so conversion can be sliced by variant in PostHog
 * without needing native feature flags.
 */
export const LANDING_COPY: Record<LandingVariant, LandingCopy> = {
  v1: {
    badge: "Analyse IA gratuite en 60 secondes",
    headlineBefore: "Obtiens plus de ",
    headlineHighlight: "matchs",
    headlineAfter: " grâce à l'IA",
    subheadline:
      "Envoie ton profil de rencontre et découvre exactement ce qui t'empêche d'avoir plus de matchs — sur Tinder, Hinge ou Bumble.",
    ctaLabel: "Analyser mon profil gratuitement",
  },
  v2: {
    badge: "Analyse IA gratuite en 60 secondes",
    headlineBefore: "Découvre pourquoi tu n'as ",
    headlineHighlight: "aucun match",
    headlineAfter: "",
    subheadline:
      "Tes photos, ta bio et tes conversations sont notées par l'IA — vois exactement ce qui te coûte des matchs avant de swiper une journée de plus pour rien.",
    ctaLabel: "Montre-moi ce qui cloche",
  },
  v3: {
    badge: "Analyse IA gratuite en 60 secondes",
    headlineBefore: "Ton profil de rencontre te ",
    headlineHighlight: "freine",
    headlineAfter: "",
    subheadline:
      "La plupart des profils sont à une photo près d'avoir beaucoup plus de matchs. Découvre exactement ce qui ne va pas avec le tien en 60 secondes.",
    ctaLabel: "Corriger mon profil gratuitement",
  },
};

export function pickRandomVariant(): LandingVariant {
  return LANDING_VARIANTS[Math.floor(Math.random() * LANDING_VARIANTS.length)];
}

export function isLandingVariant(value: string | undefined): value is LandingVariant {
  return !!value && (LANDING_VARIANTS as string[]).includes(value);
}
