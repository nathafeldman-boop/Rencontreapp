import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MessageCircleQuestion, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Bio Tinder : comment l'écrire (avec des exemples qui marchent)",
  description:
    "Pourquoi la plupart des bios Tinder se ressemblent toutes, la structure qui donne envie de répondre, et des exemples réels pour homme et pour femme.",
  path: "/bio-tinder",
  keywords: ["bio tinder", "comment écrire sa bio tinder", "exemple bio tinder", "générateur bio tinder"],
});

const FAQ = [
  {
    question: "Faut-il absolument mettre une bio sur Tinder ?",
    answer:
      "Oui — un profil sans bio n'a aucune information pour amorcer une conversation au-delà des photos, ce qui laisse le premier message entièrement à la charge de l'autre personne. Même deux lignes avec un détail précis font une vraie différence.",
  },
  {
    question: "Quelle longueur idéale pour une bio Tinder ?",
    answer:
      "Deux à quatre phrases courtes suffisent largement. L'objectif n'est pas de tout raconter, juste de donner un ou deux détails précis et une ouverture facile à relancer.",
  },
  {
    question: "Une bio drôle marche-t-elle mieux qu'une bio sérieuse ?",
    answer:
      "Ni l'une ni l'autre par défaut — ce qui compte, c'est la spécificité, pas le ton. Une bio sérieuse mais précise (« je termine une thèse sur [sujet], demande-moi si tu veux vraiment savoir ») fonctionne aussi bien qu'une bio drôle, tant qu'elle sonne comme toi et pas comme un modèle générique.",
  },
  {
    question: "Comment savoir si ma bio est bonne ?",
    answer:
      "Relis-la à voix haute et demande-toi si n'importe qui d'autre pourrait l'avoir écrite mot pour mot. Si oui, elle manque de spécificité. L'analyse gratuite de Flirtcraft évalue aussi ta bio en contexte avec tes photos.",
  },
];

export default function BioTinderPillarPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Bio Tinder", path: "/bio-tinder" }])} />

      <section className="px-6 pt-20 pb-12 sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Bio Tinder&nbsp;: comment l&apos;écrire (avec des exemples qui marchent)
          </h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Une bio Tinder qui fonctionne tient en deux à quatre phrases&nbsp;: un détail précis et un peu
            inattendu sur toi, une pointe d&apos;humour ou d&apos;auto-dérision si ça te ressemble, et une ouverture
            facile à relancer. Ce qui la rend mauvaise n&apos;est presque jamais sa longueur — c&apos;est le
            manque de spécificité.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/tinder-bio-generator">
                Générer ma bio maintenant
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tinder">Voir le guide complet profil Tinder</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">Pourquoi la plupart des bios se ressemblent toutes</h2>
          <p className="mt-3 text-muted-foreground">
            « J&apos;aime voyager, j&apos;aime rire, on verra la suite » n&apos;est pas une mauvaise bio en soi —
            elle est juste interchangeable. N&apos;importe qui sur l&apos;application pourrait l&apos;écrire mot
            pour mot, ce qui veut dire qu&apos;elle ne donne à personne de raison précise de te répondre plutôt
            qu&apos;un autre profil.
          </p>
          <p className="mt-3 text-muted-foreground">
            À l&apos;inverse, une bio trop défensive (« pas ici pour un plan cul », « ne réponds pas si… ») définit
            ce que tu n&apos;es pas, jamais ce que tu es, et donne un ton froid dès la première ligne.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">La structure qui marche presque à chaque fois</h2>
              <p className="mt-3 text-muted-foreground">
                Un détail concret et un peu inattendu sur toi, suivi d&apos;une pointe d&apos;humour ou
                d&apos;auto-dérision si ça te ressemble, terminé par une question ou une ouverture claire. Pas
                besoin des trois dans cet ordre exact, mais une bio qui n&apos;a aucun des trois se lit comme une
                fiche d&apos;identité, pas comme une invitation à écrire.
              </p>
              <p className="mt-3 text-muted-foreground">
                Un dernier point qui coûte des matchs sans qu&apos;on s&apos;en rende compte&nbsp;: une bio qui ne
                colle pas au ton de tes photos crée une dissonance — le cerveau détecte l&apos;incohérence même
                sans pouvoir la nommer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <Users className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Des exemples réels, pas des généralités</h2>
              <p className="mt-3 text-muted-foreground">
                20 exemples chacun, avec pourquoi ils fonctionnent — pas juste une liste à copier-coller telle
                quelle.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/blog/exemple-bio-tinder-homme" className="text-sm text-primary underline underline-offset-4">
                  20 exemples de bio Tinder pour homme
                </Link>
                <Link href="/blog/exemple-bio-tinder-femme" className="text-sm text-primary underline underline-offset-4">
                  20 exemples de bio Tinder pour femme
                </Link>
                <Link href="/questions/bio-et-description" className="text-sm text-primary underline underline-offset-4">
                  Toutes les questions sur la bio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <MessageCircleQuestion className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
          </div>
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

      <section className="border-t border-border bg-secondary/30 px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Écris ta bio en quelques secondes</h2>
        <p className="mt-3 text-muted-foreground">
          Le générateur de Flirtcraft écrit à partir de ton vrai profil, pas d&apos;un modèle générique.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/tinder-bio-generator">
              Générer ma bio
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
