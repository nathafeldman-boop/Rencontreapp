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
    question: "Que fait concrètement un coach de rencontre IA ?",
    answer:
      "Flirtcraft note tes photos, ta bio et ton potentiel de conversation, puis te donne des corrections précises et actionnables — une bio réécrite, un ordre de photos recommandé, et des suggestions de réponses pour de vraies conversations.",
  },
  {
    question: "Est-il disponible à tout moment ?",
    answer: "Oui — chaque outil (analyse, générateur de bio, coach de conversation, simulateur de match) est disponible à la demande, 24h/24.",
  },
  {
    question: "Dois-je déjà avoir un profil de rencontre ?",
    answer: "Non — tu peux envoyer des photos et une ébauche de bio pendant l'onboarding, même avant d'avoir créé un profil sur Tinder, Hinge ou Bumble.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Coach de rencontre IA — Coaching personnalisé profil & conversation",
  description:
    "Flirtcraft est un coach de rencontre IA disponible 24h/24 : analyse de profil, optimisation photo, génération de bio, coaching de conversation, et un simulateur d'entraînement en direct.",
  path: "/ai-dating-coach",
  keywords: ["coach de rencontre ia", "application coach de rencontre", "assistant de rencontre ia", "coach de rencontre en ligne"],
});

const FEATURES = [
  { icon: Camera, title: "Photo Optimizer", description: "Notation photo par photo et une photo principale recommandée." },
  { icon: Sparkles, title: "Bio Generator", description: "5 bios dans ton style, construites à partir de ton vrai profil." },
  { icon: MessageCircle, title: "Coach de conversation", description: "Colle une conversation en panne, obtiens 3 façons de la relancer." },
  { icon: Swords, title: "Simulateur de match", description: "Entraîne-toi à de vraies conversations avec un persona IA." },
  { icon: Gauge, title: "Dating Score", description: "Un seul chiffre qui suit la solidité de ton profil dans le temps." },
];

export default function AiDatingCoachPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />

      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            Ton coach de rencontre, disponible 24h/24
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Un coach de rencontre IA qui coache vraiment</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Pas juste un score — une boîte à outils complète qui réécrit ta bio, classe tes photos, et t&apos;aide à
            t&apos;entraîner aux conversations avant qu&apos;elles ne comptent vraiment.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Essayer gratuitement
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
          <h2 className="text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Découvre ton coach de rencontre IA</h2>
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
