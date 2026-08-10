import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { buildMetadata } from "@/lib/seo/site";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { FAQ_CATEGORIES, findFaqCategory } from "@/lib/content/faq-hub";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return FAQ_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findFaqCategory(slug);
  if (!category) return {};

  return buildMetadata({
    title: `${category.title} — Questions & réponses`,
    description: category.description,
    path: `/questions/${category.slug}`,
  });
}

export default async function FaqCategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = findFaqCategory(slug);
  if (!category) notFound();

  return (
    <main className="flex-1 px-6 py-16 sm:py-24">
      <JsonLd data={faqJsonLd(category.entries.map((e) => ({ question: e.question, answer: e.answer })))} />

      <div className="mx-auto max-w-2xl">
        <Link href="/questions" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Toutes les questions
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{category.title}</h1>
        <p className="mt-3 text-balance text-lg text-muted-foreground">{category.description}</p>

        <div className="mt-10 flex flex-col gap-4">
          {category.entries.map((entry) => (
            <div key={entry.slug} id={entry.slug} className="scroll-mt-24 rounded-xl border border-border bg-card p-5">
              <h2 className="flex items-start gap-2 font-medium">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {entry.question}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{entry.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-secondary/30 p-6 text-center">
          <h2 className="font-medium">Envie d&apos;un avis précis sur ton propre profil ?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Flirtcraft analyse tes vraies photos et ta vraie bio, pas des généralités.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/auth/login">
              Analyser mon profil gratuitement
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
