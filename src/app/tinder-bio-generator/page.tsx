import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/marketing/testimonials";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/site";

const EXAMPLES = [
  {
    style: "Funny",
    bio: "Professional dog-petter, amateur chef (ask me about the great risotto incident).",
  },
  {
    style: "Confident",
    bio: "I know what I want, and I'm not afraid to go get it — that includes this.",
  },
  {
    style: "Mysterious",
    bio: "Ask me about the trip that changed everything. I'll only tell you in person.",
  },
];

const FAQ = [
  {
    question: "Is the Tinder bio generator free?",
    answer: "Yes — create a free account to generate 5 bios in the style of your choice, built from your own profile.",
  },
  {
    question: "Can I edit the generated bios?",
    answer: "Yes — copy, regenerate, or edit any of the 5 suggestions before using it on your profile.",
  },
  {
    question: "Does it work for Hinge and Bumble too?",
    answer: "Yes, the same generator adapts to whichever app you tell it you're using during onboarding.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Free AI Tinder Bio Generator",
  description:
    "Generate 5 Tinder bios in your style — funny, mysterious, confident, romantic, or premium — built from your real profile, free to try.",
  path: "/tinder-bio-generator",
  keywords: ["tinder bio generator", "ai bio generator", "dating bio generator", "tinder bio ideas"],
});

export default function TinderBioGeneratorPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />

      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            5 bios, your style, in seconds
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Free AI Tinder Bio Generator</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Pick a style — funny, mysterious, confident, romantic, or premium — and get 5 bios built from your
            actual profile, not generic filler.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Generate My Bio Free
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">A few examples</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {EXAMPLES.map((example) => (
              <Card key={example.style}>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-3">
                    {example.style}
                  </Badge>
                  <p className="text-sm">{example.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="mt-6 flex flex-col gap-4">
            {FAQ.map((item) => (
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Get 5 bios built for you</h2>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              Generate My Bio Free
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
