import type { Metadata } from "next";

import { buildMetadata, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Mentions légales",
  description: `Mentions légales de ${SITE_NAME} : éditeur du site, hébergement, propriété intellectuelle et données personnelles.`,
  path: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>
      <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : août 2026.</p>

      <div className="mt-8 flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold">1. Éditeur du site</h2>
          <div className="mt-2 flex flex-col gap-3 text-muted-foreground">
            <p>
              Le site {SITE_NAME} est édité par Nathanaël Feldman et Marceau Ville, personnes physiques
              exerçant en nom propre.
            </p>
            <p>
              Adresse : 2 bis rue Falret, [code postal et ville à compléter].
            </p>
            <p>
              Statut : l&apos;activité est en cours d&apos;immatriculation (micro-entreprise non encore
              enregistrée à la date de publication de ces mentions légales).
            </p>
            <p>Contact : [adresse email de contact à compléter].</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Hébergement</h2>
          <div className="mt-2 flex flex-col gap-3 text-muted-foreground">
            <p>
              L&apos;application est hébergée par Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789,
              États-Unis — vercel.com).
            </p>
            <p>
              La base de données et l&apos;authentification sont hébergées par Supabase Inc.
              (supabase.com).
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Propriété intellectuelle</h2>
          <p className="mt-2 text-muted-foreground">
            L&apos;ensemble des éléments du site {SITE_NAME} (textes, design, logo, code) est protégé par
            le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou
            partielle, sans autorisation, est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Données personnelles</h2>
          <p className="mt-2 text-muted-foreground">
            {SITE_NAME} collecte et traite des données personnelles (compte, photos et bio soumises pour
            analyse, données de facturation) dans le respect du RGPD. Une politique de confidentialité
            détaillée sera publiée prochainement. Pour toute question ou demande d&apos;accès, de
            rectification ou de suppression de tes données, contacte-nous à l&apos;adresse indiquée à la
            section 1.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Cookies et analytics</h2>
          <p className="mt-2 text-muted-foreground">
            Le site utilise PostHog pour mesurer l&apos;usage et améliorer le service. Ces outils peuvent
            déposer des cookies ou identifiants techniques sur ton navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Limitation de responsabilité</h2>
          <p className="mt-2 text-muted-foreground">
            Les analyses et recommandations fournies par {SITE_NAME} sont générées à l&apos;aide
            d&apos;intelligence artificielle et ont une valeur indicative. Elles ne constituent aucune
            garantie de résultat sur les applications de rencontre.
          </p>
        </section>
      </div>
    </main>
  );
}
