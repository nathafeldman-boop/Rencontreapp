import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/marketing/animated-counter";
import { BeforeAfterSection } from "@/components/marketing/before-after";
import { Testimonials } from "@/components/marketing/testimonials";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/structured-data";
import type { AppReviewContent } from "@/lib/content/app-reviews";

const STEPS = [
  { title: "Upload your profile", description: "Photos, bio, and a couple of quick questions." },
  { title: "AI analyzes it", description: "Scored on photos, bio, attractiveness, and conversation potential." },
  { title: "Get your score", description: "See exactly what's working and what to fix first." },
];

export function AppReviewLanding({ content }: { content: AppReviewContent }) {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(content.faq)} />

      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            Free {content.appName} analysis in 60 seconds
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{content.headline}</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">{content.intro}</p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Analyze My {content.appName} Profile Free
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              <AnimatedCounter />
            </span>{" "}
            profiles analyzed and counting
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Sound like your {content.appName}?
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {content.painPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-xl border border-border bg-card p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BeforeAfterSection />
      <Testimonials />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="mt-6 flex flex-col gap-4">
            {content.faq.map((item) => (
              <div key={item.question} className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-start gap-2 font-medium">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item.question}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Find out what&apos;s holding your {content.appName} profile back
        </h2>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              Analyze My Profile Free
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
