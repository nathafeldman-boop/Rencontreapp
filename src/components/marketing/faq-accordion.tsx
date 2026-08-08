"use client";

import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui — en un clic depuis Réglages > Gérer l'abonnement, sans appel téléphonique, sans parcours de rétention. Tu gardes l'accès jusqu'à la fin de ta période de facturation en cours.",
  },
  {
    q: "Mon paiement est-il sécurisé ?",
    a: "Les paiements sont traités par Stripe. Flirtcraft ne voit ni ne stocke jamais ton numéro de carte.",
  },
  {
    q: "Qu'advient-il de mes données si j'annule ?",
    a: "Tes analyses passées et ton historique restent dans ton compte — tu perds juste l'accès aux outils premium jusqu'à ton réabonnement.",
  },
  {
    q: "Est-ce que ça va vraiment marcher pour moi ?",
    a: "Chaque recommandation est générée à partir de tes propres photos, ta bio et ton objectif déclaré — pas une checklist générique.",
  },
];

export function FaqAccordion() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-4">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Questions fréquentes</h2>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium marker:content-none">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
