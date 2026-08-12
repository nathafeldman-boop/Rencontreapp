import type { DatingApp } from "@/types/database.types";

/**
 * Apps that get a distinct visual identity — "other" deliberately excluded,
 * it keeps the default Flirtcraft brand (see spec: "si il mettent 'autre'
 * alors on garde le design de base"). Drives the `data-dating-app`
 * attribute consumed by the `[data-dating-app="..."]` CSS var overrides in
 * globals.css — everything under that attribute (buttons, links, the
 * progress/score bars, `bg-brand-gradient`) re-themes automatically since
 * they're all already built on top of the same CSS custom properties.
 */
export type ThemedDatingApp = "tinder" | "hinge" | "bumble";

const THEMED_APPS = new Set<ThemedDatingApp>(["tinder", "hinge", "bumble"]);

export function themedDatingApp(app: DatingApp | null | undefined): ThemedDatingApp | undefined {
  return app && THEMED_APPS.has(app as ThemedDatingApp) ? (app as ThemedDatingApp) : undefined;
}

export const DATING_APP_LABELS: Record<DatingApp, string> = {
  tinder: "Tinder",
  hinge: "Hinge",
  bumble: "Bumble",
  other: "ton app",
};
