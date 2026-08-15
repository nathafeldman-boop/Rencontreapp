import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Check, MessageCircleQuestion, PenLine, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Comment optimiser son profil Tinder — le guide complet",
  description:
    "Photo principale, bio, ordre des photos, manque de matchs : tout ce qui détermine si ton profil Tinder convertit, avec les corrections concrètes à faire en premier.",
  path: "/tinder",
  keywords: ["optimiser profil tinder", "améliorer profil tinder", "comment avoir plus de matchs tinder", "profil tinder qui marche"],
});

const FAQ = [
  {
    question: "Combien de temps faut-il pour optimiser son profil Tinder ?",
    answer:
      "Les corrections qui comptent le plus — réordonner tes photos, réécrire ta bio — prennent en général 15 à 20 minutes une fois que tu sais précisément quoi changer. C'est justement ce que l'analyse gratuite de Flirtcraft te dit en premier.",
  },
  {
    question: "Faut-il refaire toutes ses photos pour améliorer son profil ?",
    answer:
      "Non, dans la grande majorité des cas. Le problème n'est presque jamais la qualité des photos elles-mêmes, mais leur ordre, leur luminosité, ou le fait que la première photo ne montre pas clairement ton visage. Réorganiser des photos existantes suffit souvent à changer le résultat.",
  },
  {
    question: "Pourquoi mon profil Tinder recevait des matchs avant, et plus maintenant ?",
    answer:
      "Souvent parce que les photos ou la bio n'ont pas changé depuis longtemps et que les mêmes personnes les ont déjà vues, ou parce qu'un changement récent (nouvelle photo principale, bio modifiée) a involontairement affaibli le profil. Voir le détail dans notre article sur la baisse de matchs.",
  },
  {
    question: "L'analyse Flirtcraft fonctionne-t-elle si j'ai déjà beaucoup de matchs ?",
    answer:
      "Oui — elle est tout aussi utile pour améliorer la qualité de tes matchs et le taux de conversation en conversation que pour quelqu'un qui part de zéro.",
  },
];

export default function TinderPillarPage() {
  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Tinder", path: "/tinder" }])} />

      <section className="px-6 pt-20 pb-12 sm:pt-28">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Comment optimiser son profil Tinder</h1>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Trois choses décident si ton profil convertit, dans cet ordre&nbsp;: une photo principale nette où l&apos;on
            te voit seul(e) en pleine lumière, trois à six photos qui montrent une vraie diversité (pas six
            variations du même selfie), et une bio avec un détail précis qui donne une raison concrète de
            répondre. Le reste — filtres, activité, heure de connexion — pèse beaucoup moins que ces trois-là.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Analyser mon profil Tinder gratuitement
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tinder-profile-review">Voir comment fonctionne l&apos;analyse</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <Camera className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ta photo principale décide (presque) tout</h2>
              <p className="mt-3 text-muted-foreground">
                Sur Tinder, la décision de swiper à droite se prend en moins d&apos;une seconde, presque
                entièrement sur ta première photo. Une photo de groupe, un selfie flou ou une mauvaise lumière, et
                le reste de ton profil — bio, autres photos, vraie personnalité — n&apos;est jamais vu.
              </p>
              <p className="mt-3 text-muted-foreground">
                La correction est mécanique, pas esthétique&nbsp;: une photo où tu es seul(e), le visage net et
                bien éclairé (la lumière naturelle du jour bat presque toujours un éclairage intérieur), sans
                lunettes de soleil ni chapeau qui cache tes yeux.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/blog/meilleures-photos-tinder" className="text-sm text-primary underline underline-offset-4">
                  Les meilleures photos Tinder à utiliser
                </Link>
                <Link href="/questions/photos-de-profil" className="text-sm text-primary underline underline-offset-4">
                  Toutes les questions sur les photos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <PenLine className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ta bio doit donner une raison de répondre</h2>
              <p className="mt-3 text-muted-foreground">
                « J&apos;aime voyager, j&apos;aime rire » décrit à peu près la moitié de Tinder et ne donne à
                personne de quoi répondre. Une bio qui nomme un détail précis et légèrement inhabituel — une
                opinion tranchée, une compétence bizarrement spécifique — est à la fois plus mémorable et plus
                facile à relancer. Terminer par une question légère transforme la bio en amorce de conversation
                plutôt qu&apos;en cul-de-sac.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/bio-tinder" className="text-sm text-primary underline underline-offset-4">
                  Le guide complet pour écrire ta bio
                </Link>
                <Link href="/tinder-bio-generator" className="text-sm text-primary underline underline-offset-4">
                  Générer ta bio en quelques secondes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-1 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Pourquoi tu n&apos;as pas (ou plus) de matchs</h2>
              <p className="mt-3 text-muted-foreground">
                Un manque de matchs n&apos;est presque jamais une question de chance ou d&apos;algorithme caché —
                c&apos;est presque toujours traçable à une des trois choses ci-dessus, ou à un profil qui n&apos;a
                pas changé depuis longtemps et que les mêmes personnes ont déjà vu passer.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/blog/pourquoi-aucun-match-tinder" className="text-sm text-primary underline underline-offset-4">
                  Pourquoi tu n&apos;as aucun match (alors que tu n&apos;es pas moche)
                </Link>
                <Link href="/blog/avoir-plus-de-matchs-tinder" className="text-sm text-primary underline underline-offset-4">
                  Comment obtenir plus de matchs
                </Link>
                <Link href="/questions/manque-de-matchs" className="text-sm text-primary underline underline-offset-4">
                  Toutes les questions sur le manque de matchs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">4 étapes pour améliorer ton profil aujourd&apos;hui</h2>
          <ol className="mt-6 flex flex-col gap-3">
            {[
              "Regarde tes photos actuelles dans l'ordre où elles apparaissent — pas dans l'ordre où tu les préfères. La première doit montrer ton visage seul, net, en pleine lumière.",
              "Retire toute photo où on te distingue mal (groupe, contre-jour, lunettes de soleil) des trois premières positions.",
              "Relis ta bio à voix haute. Si elle pourrait être copiée-collée sur n'importe quel autre profil, remplace-la par un détail que toi seul(e) pourrais écrire.",
              "Fais analyser ton profil pour voir précisément ce qui te coûte des matchs plutôt que de deviner.",
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Découvre précisément ce qui freine ton profil Tinder
        </h2>
        <p className="mt-3 text-muted-foreground">Envoie tes photos et ta bio, obtiens ton score en 60 secondes.</p>
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
