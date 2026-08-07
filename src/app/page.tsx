import dynamic from "next/dynamic";

import { Hero } from "@/components/marketing/hero";

/**
 * Below-the-fold sections, code-split from the Hero's critical bundle.
 * `ssr: true` (the default) is kept explicitly so the content still
 * renders in the initial HTML for SEO/no-JS — this only defers when the
 * *client* chunk downloads, which the Hero's LCP doesn't need to wait on.
 */
const ProblemSection = dynamic(() => import("@/components/marketing/problem-section").then((m) => m.ProblemSection));
const SolutionSection = dynamic(() => import("@/components/marketing/solution-section").then((m) => m.SolutionSection));
const BeforeAfterSection = dynamic(() => import("@/components/marketing/before-after").then((m) => m.BeforeAfterSection));
const Testimonials = dynamic(() => import("@/components/marketing/testimonials").then((m) => m.Testimonials));
const FinalCta = dynamic(() => import("@/components/marketing/final-cta").then((m) => m.FinalCta));

export default function LandingPage() {
  return (
    <main className="flex-1">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <BeforeAfterSection />
      <Testimonials />
      <FinalCta />
    </main>
  );
}
