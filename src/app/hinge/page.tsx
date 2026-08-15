import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MessageCircleQuestion, PenLine, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Comment optimiser son profil Hinge — le guide complet",
  description:
    "Hinge fonctionne autour de prompts, pas d'une bio libre. Voici comment choisir les bons, y répondre sans sonner générique, et ce qui compte vraiment pour l'ordre des photos.",
  path: "/hinge",
  keywords: ["optimiser profil hinge", "améliorer profil hinge", "prompts hinge", "comment ça marche hinge"],
});

const FAQ = [
  {
    question: "Faut-il répondre aux 3 prompts Hinge, ou moins suffit ?",
    answer:
      "Les 3 sont recommandés — c'est la structure que l'application met le plus en avant dans le profil. Les laisser vides ou n'en remplir qu'un revient à laisser de la place vacante là où d'autres profils donnent des détails concrets à commenter.",
  },
  {
    question: "Combien de photos faut-il sur Hinge ?",
    answer:
      "Entre 4 et 6, alternées avec les prompts plutôt que regroupées toutes ensemble — Hinge affiche prompts et photos dans un ordre mixte, donc chaque photo doit pouvoir tenir seule sans dépendre de la précédente pour être comprise.",
  },
  {
    question: "Hinge est-il vraiment plus orienté relation sérieuse que Tinder ?",
    answer:
      "Hinge se positionne explicitement comme l'application « conçue pour être supprimée », et son format de prompts détaillés pousse structurellement vers des profils plus construits. Ça ne garantit rien à titre individuel — on trouve des profils cherchant tout et n'importe quoi sur chaque application — mais le format encourage cette direction.",
  },
  {
    question: "L'analyse Flirtcraft prend-elle en compte les prompts, pas juste la bio ?",
    answer:
      "Oui — pour un profil Hinge, l'analyse évalue tes réponses aux prompts et l'ordre de tes photos, pas une bio libre qui n'existe pas sur cette application.",
  },
];

export default function HingePillarPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Hinge", path: "/hinge" }])} />

      <section className="px-6 pt-20 pb-12 sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Comment optimiser son profil Hinge</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Hinge fonctionne différemment de Tinder ou Bumble&nbsp;: pas de bio libre, ton profil se construit
            autour de trois prompts avec réponse, mélangés à tes photos. Ce qui compte&nbsp;: des réponses avec un
            détail spécifique (pas une liste de qualités interchangeables), une première photo nette, et des
            photos qui se comprennent chacune indépendamment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Analyser mon profil Hinge gratuitement
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/hinge-profile-review">Voir comment fonctionne l&apos;analyse</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <PenLine className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Le prompt n&apos;est qu&apos;une amorce — la réponse fait tout le travail</h2>
              <p className="mt-3 text-muted-foreground">
                Hinge affiche des centaines de réponses à peu près identiques au même prompt chaque jour. Une
                réponse générique se noie, même si le prompt choisi était le bon. La règle simple&nbsp;: chaque
                réponse doit contenir un détail que personne d&apos;autre ne pourrait écrire mot pour mot.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/blog/prompts-hinge-qui-marchent" className="text-sm text-primary underline underline-offset-4">
                  Comment écrire des prompts Hinge qui donnent envie de répondre
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <Shuffle className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ce qui différencie vraiment Hinge de Tinder et Bumble</h2>
              <p className="mt-3 text-muted-foreground">
                Tinder a le plus d&apos;utilisateurs et un rythme rapide orienté volume de swipes. Bumble donne
                aux femmes l&apos;initiative du premier message. Hinge met l&apos;accent sur la compatibilité via
                des prompts détaillés plutôt que sur le swipe rapide — ce qui attire souvent un public cherchant
                quelque chose de plus construit, même si aucune application ne le garantit avec certitude.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/questions/choisir-son-application#tinder-bumble-ou-hinge"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Tinder, Bumble ou Hinge : laquelle choisir ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">3 étapes pour améliorer ton profil Hinge aujourd&apos;hui</h2>
          <ol className="mt-6 flex flex-col gap-3">
            {[
              "Relis tes 3 réponses aux prompts. Si une seule pourrait être copiée-collée sur n'importe quel autre profil, remplace-la par un détail précis (une anecdote, une opinion tranchée, un scénario).",
              "Choisis des prompts qui appellent une histoire plutôt qu'une liste — un prompt comme « Ma théorie non scientifique sur... » force naturellement une réponse plus spécifique qu'un prompt du type « Mes centres d'intérêt ».",
              "Fais analyser ton profil pour voir précisément quels prompts et quelles photos affaiblissent ton profil plutôt que de deviner.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Découvre ce qui freine ton profil Hinge</h2>
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
