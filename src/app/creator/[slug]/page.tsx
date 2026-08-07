import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Tag } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Testimonials } from "@/components/marketing/testimonials";
import { BeforeAfterSection } from "@/components/marketing/before-after";
import { buildMetadata } from "@/lib/seo/site";

interface CreatorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("name")
    .eq("slug", slug)
    .eq("active", true)
    .abortSignal(AbortSignal.timeout(5000))
    .maybeSingle();

  if (!creator) return {};

  return buildMetadata({
    title: `${creator.name} x MatchAI`,
    description: `${creator.name} t'envoie vers MatchAI — obtiens une analyse IA gratuite de ton profil de rencontre.`,
    path: `/creator/${slug}`,
  });
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("name, headline, promo_code")
    .eq("slug", slug)
    .eq("active", true)
    .abortSignal(AbortSignal.timeout(5000))
    .maybeSingle();

  if (!creator) notFound();

  return (
    <main className="flex-1">
      <section className="px-6 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Badge variant="accent" className="mb-6">
            {creator.name} x MatchAI
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {creator.headline ?? `${creator.name} t'envoie ici — obtiens plus de matchs avec l'IA`}
          </h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Envoie ton profil de rencontre et obtiens une analyse IA gratuite — photos, bio, et potentiel de
            conversation, notés en environ une minute.
          </p>

          {creator.promo_code && (
            <div className="mt-6 flex items-center gap-2 rounded-full border border-primary/40 bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              <Tag className="size-4" />
              Utilise le code {creator.promo_code} pour 20% de réduction sur ton premier mois
            </div>
          )}

          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Analyser mon profil gratuitement
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <BeforeAfterSection />
      <Testimonials />
    </main>
  );
}
