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
  { title: "Envoie ton profil", description: "Photos, bio, et quelques questions rapides." },
  { title: "L'IA l'analyse", description: "Notation sur les photos, la bio, l'attractivité et le potentiel de conversation." },
  { title: "Obtiens ton score", description: "Vois exactement ce qui fonctionne et ce qu'il faut corriger en premier." },
];

export function AppReviewLanding({ content }: { content: AppReviewContent }) {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(content.faq)} />

      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            Analyse {content.appName} gratuite en 60 secondes
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{content.headline}</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">{content.intro}</p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Analyser mon profil {content.appName} gratuitement
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              <AnimatedCounter />
            </span>{" "}
            profils analysés, et ça continue
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Ça te parle sur {content.appName} ?
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
          <h2 className="text-center text-2xl font-semibold tracking-tight">Comment ça marche</h2>
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
          <h2 className="text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
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
          Découvre ce qui freine ton profil {content.appName}
        </h2>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              Analyser mon profil gratuitement
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
