import { Hero } from "@/components/marketing/hero";
import { ProblemSection } from "@/components/marketing/problem-section";
import { SolutionSection } from "@/components/marketing/solution-section";
import { BeforeAfterSection } from "@/components/marketing/before-after";
import { Testimonials } from "@/components/marketing/testimonials";
import { FinalCta } from "@/components/marketing/final-cta";

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
