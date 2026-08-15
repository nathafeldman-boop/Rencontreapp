import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buildMetadata } from "@/lib/seo/site";
import { FAQ_CATEGORIES } from "@/lib/content/faq-hub";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Questions sur les applications de rencontre — Photos, bio, matchs, conversation",
  description:
    "Toutes les réponses concrètes sur les profils de rencontre : quelles photos choisir, comment écrire sa bio, pourquoi on n'a pas de matchs, comment relancer une conversation.",
  path: "/questions",
});

export default function QuestionsHubPage() {
  return (
    <main className="flex-1 px-6 py-16 sm:py-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Questions", path: "/questions" }])} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions sur les profils de rencontre
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">
          Des réponses concrètes, sans blabla, aux questions qu&apos;on se pose vraiment sur Tinder, Bumble et Hinge —
          photos, bio, matchs, conversation, confiance en soi et sécurité.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FAQ_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/questions/${category.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <h2 className="flex items-center justify-between font-medium">
                {category.title}
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </h2>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <span className="mt-1 text-xs text-muted-foreground">
                {category.entries.length} question{category.entries.length > 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
