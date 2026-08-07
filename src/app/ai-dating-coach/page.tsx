import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Check, Gauge, MessageCircle, Sparkles, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Testimonials } from "@/components/marketing/testimonials";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/site";

const FAQ = [
  {
    question: "What does an AI dating coach actually do?",
    answer:
      "MatchAI scores your photos, bio, and conversation potential, then gives you specific, actionable fixes — a rewritten bio, a recommended photo order, and suggested replies for real conversations.",
  },
  {
    question: "Is it available any time?",
    answer: "Yes — every tool (analysis, bio generator, conversation coach, match simulator) is available on demand, 24/7.",
  },
  {
    question: "Do I need to already have a dating profile?",
    answer: "No — you can upload photos and a draft bio during onboarding even before you've created a profile on Tinder, Hinge, or Bumble.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "AI Dating Coach — Personalized Profile & Conversation Coaching",
  description:
    "MatchAI is an AI dating coach available 24/7: profile analysis, photo optimization, bio generation, conversation coaching, and a live practice simulator.",
  path: "/ai-dating-coach",
  keywords: ["ai dating coach", "dating coach app", "ai dating assistant", "online dating coach"],
});

const FEATURES = [
  { icon: Camera, title: "Photo Optimizer", description: "Per-photo scoring and a recommended lead photo." },
  { icon: Sparkles, title: "Bio Generator", description: "5 bios in your style, built from your real profile." },
  { icon: MessageCircle, title: "Conversation Coach", description: "Paste a stalled chat, get 3 ways to revive it." },
  { icon: Swords, title: "Match Simulator", description: "Practice real conversations with an AI persona." },
  { icon: Gauge, title: "Dating Score", description: "One number that tracks your profile strength over time." },
];

export default function AiDatingCoachPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />

      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            Your dating coach, available 24/7
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">An AI Dating Coach That Actually Coaches</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Not just a score — a full toolkit that rewrites your bio, ranks your photos, and helps you practice
            conversations before they count.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Try It Free
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
                <feature.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Meet your AI dating coach</h2>
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
