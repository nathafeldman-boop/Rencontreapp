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
    style: "Drôle",
    bio: "Caresseuse de chiens professionnelle, cheffe amateure (demande-moi le grand incident du risotto).",
  },
  {
    style: "Confiant",
    bio: "Je sais ce que je veux, et je n'ai pas peur d'aller le chercher — ça inclut ça.",
  },
  {
    style: "Mystérieux",
    bio: "Demande-moi pour le voyage qui a tout changé. Je ne raconte ça qu'en personne.",
  },
];

const FAQ = [
  {
    question: "Le générateur de bio Tinder est-il gratuit ?",
    answer: "Oui — crée un compte gratuit pour générer 5 bios dans le style de ton choix, construites à partir de ton propre profil.",
  },
  {
    question: "Puis-je modifier les bios générées ?",
    answer: "Oui — copie, régénère, ou modifie n'importe laquelle des 5 suggestions avant de l'utiliser sur ton profil.",
  },
  {
    question: "Ça fonctionne aussi pour Hinge et Bumble ?",
    answer: "Oui, le même générateur s'adapte à l'application que tu indiques utiliser pendant l'onboarding.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Générateur de bio Tinder par IA — gratuit",
  description:
    "Génère 5 bios Tinder dans ton style — drôle, mystérieux, confiant, romantique, ou premium — construites à partir de ton vrai profil, gratuit à essayer.",
  path: "/tinder-bio-generator",
  keywords: ["générateur de bio tinder", "générateur de bio ia", "générateur de bio de rencontre", "idées de bio tinder"],
});

export default function TinderBioGeneratorPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />

      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            5 bios, ton style, en quelques secondes
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Générateur de bio Tinder par IA, gratuit</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Choisis un style — drôle, mystérieux, confiant, romantique, ou premium — et obtiens 5 bios construites
            à partir de ton vrai profil, pas du remplissage générique.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Générer ma bio gratuitement
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Quelques exemples</h2>
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Obtiens 5 bios construites pour toi</h2>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/auth/login">
              Générer ma bio gratuitement
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
