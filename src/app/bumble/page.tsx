import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock, MessageCircleQuestion, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Comment optimiser son profil Bumble — le guide complet",
  description:
    "Sur Bumble, c'est la femme qui écrit en premier. Voici ce que ça change concrètement pour ton profil, ta bio, et tes photos, côté homme comme côté femme.",
  path: "/bumble",
  keywords: ["optimiser profil bumble", "améliorer profil bumble", "bumble femme premier message", "profil bumble qui marche"],
});

const FAQ = [
  {
    question: "Que se passe-t-il si le premier message n'est pas envoyé à temps sur Bumble ?",
    answer:
      "Le match expire et disparaît — il faut re-matcher pour retenter, ce qui n'arrive pas automatiquement. C'est justement pour ça qu'un profil qui donne envie d'écrire tout de suite compte plus sur Bumble que sur une application sans cette contrainte de temps.",
  },
  {
    question: "En tant qu'homme, puis-je faire quelque chose si c'est la femme qui doit écrire en premier ?",
    answer:
      "Le seul levier direct est ton profil lui-même — puisque tu ne peux pas rattraper un profil faible par un bon message d'ouverture, il doit se suffire à lui-même. Une bio avec un détail facile à relancer joue exactement le rôle qu'un bon message d'ouverture jouerait ailleurs.",
  },
  {
    question: "Faut-il payer Bumble Premium pour de meilleurs résultats ?",
    answer:
      "Ça dépend surtout de ce que l'abonnement change concrètement (likes illimités, retour en arrière, visibilité boostée) plutôt que d'un principe général. Un profil plus fort a en général plus d'impact sur les résultats qu'un abonnement premium sur un profil faible.",
  },
  {
    question: "L'analyse Flirtcraft fonctionne-t-elle pour Bumble comme pour Tinder ?",
    answer:
      "Oui — l'analyse évalue tes photos, ta bio et ta présentation générale de la même façon rigoureuse, en tenant compte du fait que sur Bumble, c'est souvent la personne qui reçoit le message qui doit être convaincue d'écrire en premier.",
  },
];

export default function BumblePillarPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Bumble", path: "/bumble" }])} />

      <section className="px-6 pt-20 pb-12 sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Comment optimiser son profil Bumble</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            La règle fondatrice de Bumble change tout&nbsp;: dans les matchs hétéro, c&apos;est la femme qui
            écrit en premier, avec un match qui expire si personne n&apos;écrit à temps. Ce que ça change
            concrètement pour ton profil dépend de qui tu es — voir plus bas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Analyser mon profil Bumble gratuitement
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/bumble-profile-review">Voir comment fonctionne l&apos;analyse</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <Clock className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">La règle du premier message change tout</h2>
              <p className="mt-3 text-muted-foreground">
                C&apos;est une règle fondatrice de l&apos;application (dans les matchs hétéro), pensée pour
                rééquilibrer une dynamique où les femmes reçoivent en général beaucoup plus de messages non
                désirés que les hommes. Le match expire si le message n&apos;arrive pas dans la fenêtre impartie
                — il faut re-matcher pour retenter.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/questions/choisir-son-application#bumble-femme-envoie-premier-message"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Pourquoi sur Bumble, c&apos;est la femme qui doit écrire en premier ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <UserCheck className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ce que ça change pour ton profil</h2>
              <p className="mt-3 text-muted-foreground">
                <strong className="text-foreground">Côté homme&nbsp;:</strong> tu ne peux pas rattraper un profil
                faible par un bon message d&apos;ouverture, puisque tu n&apos;en écris pas un — ton profil et ta
                bio doivent se suffire à eux-mêmes pour donner envie d&apos;écrire.
              </p>
              <p className="mt-3 text-muted-foreground">
                <strong className="text-foreground">Côté femme&nbsp;:</strong> une bio avec un détail facile à
                relancer (une question ouverte, un sujet précis) te facilite littéralement la tâche — c&apos;est
                toi qui dois trouver quoi écrire en premier, donc plus ton propre profil te donne de matière
                évidente, plus c&apos;est simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
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

      <section className="px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Découvre ce qui freine ton profil Bumble</h2>
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
