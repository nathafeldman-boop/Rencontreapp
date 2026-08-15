import dynamic from "next/dynamic";

import { Hero } from "@/components/marketing/hero";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteJsonLd } from "@/lib/seo/structured-data";

/**
 * Below-the-fold sections, code-split from the Hero's critical bundle.
 * `ssr: true` (the default) is kept explicitly so the content still
 * renders in the initial HTML for SEO/no-JS — this only defers when the
 * *client* chunk downloads, which the Hero's LCP doesn't need to wait on.
 */
const GameplayPreview = dynamic(() => import("@/components/marketing/gameplay-preview").then((m) => m.GameplayPreview));
const BeforeAfterSection = dynamic(() => import("@/components/marketing/before-after").then((m) => m.BeforeAfterSection));
const Testimonials = dynamic(() => import("@/components/marketing/testimonials").then((m) => m.Testimonials));
const Pricing = dynamic(() => import("@/components/marketing/pricing").then((m) => m.Pricing));
const FaqAccordion = dynamic(() => import("@/components/marketing/faq-accordion").then((m) => m.FaqAccordion));
const FinalCta = dynamic(() => import("@/components/marketing/final-cta").then((m) => m.FinalCta));

export default function LandingPage() {
  return (
    <main className="flex-1">
      <JsonLd data={websiteJsonLd()} />
      <Hero />
      <Testimonials />
      <GameplayPreview />
      <BeforeAfterSection />
      <Pricing />
      <FaqAccordion />
      <FinalCta />
    </main>
  );
}
