import type { Metadata } from "next";

import { buildMetadata, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = buildMetadata({
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de ${SITE_NAME} : abonnement Premium, prix, paiement, résiliation et droit de rétractation.`,
  path: "/cgv",
});

export default function CgvPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Conditions générales de vente</h1>
      <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : août 2026.</p>

      <div className="mt-8 flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-semibold">Article 1 — Objet</h2>
          <p className="mt-2 text-muted-foreground">
            Les présentes conditions générales de vente (CGV) régissent la vente de l&apos;abonnement
            Premium proposé sur le site {SITE_NAME}, édité par Nathanaël Feldman et Marceau Ville (voir
            les{" "}
            <a href="/mentions-legales" className="underline underline-offset-2">
              mentions légales
            </a>
            ). Toute souscription à un abonnement payant implique l&apos;acceptation sans réserve des
            présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 2 — Description des services</h2>
          <div className="mt-2 flex flex-col gap-3 text-muted-foreground">
            <p>
              {SITE_NAME} propose une analyse gratuite de profil de rencontre (photos et bio) par
              intelligence artificielle, avec un aperçu des résultats.
            </p>
            <p>
              L&apos;abonnement Premium (7,99€/mois, sans engagement) débloque l&apos;intégralité des
              résultats de l&apos;analyse et des fonctionnalités additionnelles présentées sur le site au
              moment de la souscription.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 3 — Prix</h2>
          <p className="mt-2 text-muted-foreground">
            Les prix sont indiqués en euros, toutes taxes comprises. {SITE_NAME} se réserve le droit de
            modifier ses prix à tout moment ; le prix applicable à un abonnement en cours reste celui
            accepté lors de la souscription, jusqu&apos;au prochain renouvellement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 4 — Modalités de paiement</h2>
          <p className="mt-2 text-muted-foreground">
            Le paiement s&apos;effectue en ligne par carte bancaire via Stripe, prestataire de paiement
            sécurisé. L&apos;abonnement Premium est facturé mensuellement et se renouvelle
            automatiquement tant qu&apos;il n&apos;a pas été résilié.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 5 — Droit de rétractation</h2>
          <p className="mt-2 text-muted-foreground">
            Conformément aux articles L221-18 et suivants du Code de la consommation, tu disposes d&apos;un
            délai de 14 jours à compter de la souscription pour exercer ton droit de rétractation, sans
            avoir à justifier de motifs. Pour exercer ce droit, contacte-nous à l&apos;adresse indiquée à
            l&apos;article 10. Si tu as expressément demandé à bénéficier du service dès la souscription et
            avant l&apos;expiration du délai de 14 jours, ton droit de rétractation pourra ne s&apos;appliquer
            qu&apos;au prorata de l&apos;usage déjà effectué, conformément à l&apos;article L221-28 du Code
            de la consommation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 6 — Résiliation</h2>
          <p className="mt-2 text-muted-foreground">
            L&apos;abonnement Premium est sans engagement et peut être résilié à tout moment depuis
            Réglages &gt; Gérer l&apos;abonnement. La résiliation prend effet à la fin de la période de
            facturation en cours ; aucun remboursement au prorata n&apos;est effectué pour la période déjà
            engagée, sauf disposition légale contraire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 7 — Responsabilité</h2>
          <p className="mt-2 text-muted-foreground">
            Les analyses fournies par {SITE_NAME} sont générées par intelligence artificielle et ont une
            valeur indicative et informative. {SITE_NAME} ne garantit aucun résultat particulier
            (nombre de matchs, de conversations, etc.) sur les applications de rencontre.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 8 — Données personnelles</h2>
          <p className="mt-2 text-muted-foreground">
            Le traitement des données personnelles dans le cadre de la souscription et de
            l&apos;exécution du service est décrit dans nos{" "}
            <a href="/mentions-legales" className="underline underline-offset-2">
              mentions légales
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 9 — Droit applicable et litiges</h2>
          <p className="mt-2 text-muted-foreground">
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
            sera recherchée en priorité avant toute action judiciaire. Conformément à la réglementation
            en vigueur, tu peux également recourir gratuitement à un médiateur de la consommation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Article 10 — Contact</h2>
          <p className="mt-2 text-muted-foreground">
            Pour toute question relative à ces CGV ou à ton abonnement, écris-nous à [adresse email de
            contact à compléter].
          </p>
        </section>
      </div>
    </main>
  );
}
