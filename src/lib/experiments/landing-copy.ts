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
    badge: "Free AI analysis in 60 seconds",
    headlineBefore: "Get More ",
    headlineHighlight: "Matches",
    headlineAfter: " With AI",
    subheadline:
      "Upload your dating profile and discover exactly what's preventing you from getting more matches — on Tinder, Hinge, or Bumble.",
    ctaLabel: "Analyze My Profile Free",
  },
  v2: {
    badge: "Free AI analysis in 60 seconds",
    headlineBefore: "Find Out Why You Get ",
    headlineHighlight: "No Matches",
    headlineAfter: "",
    subheadline:
      "Your photos, bio, and conversations get scored by AI — see exactly what's costing you matches before you swipe another day away.",
    ctaLabel: "Show Me What's Wrong",
  },
  v3: {
    badge: "Free AI analysis in 60 seconds",
    headlineBefore: "Your Dating Profile Is ",
    headlineHighlight: "Holding You Back",
    headlineAfter: "",
    subheadline:
      "Most profiles are one photo swap away from way more matches. Find out exactly what's wrong with yours in 60 seconds.",
    ctaLabel: "Fix My Profile Free",
  },
};

export function pickRandomVariant(): LandingVariant {
  return LANDING_VARIANTS[Math.floor(Math.random() * LANDING_VARIANTS.length)];
}

export function isLandingVariant(value: string | undefined): value is LandingVariant {
  return !!value && (LANDING_VARIANTS as string[]).includes(value);
}
