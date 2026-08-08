"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "Est-ce vraiment gratuit pour commencer ?",
    a: "Oui — ton Dating Score et 2 conseils personnalisés sont gratuits, sans carte bancaire. Premium débloque l'analyse complète et les outils IA.",
  },
  {
    q: "Combien de temps ça prend ?",
    a: "Moins d'une minute pour obtenir ton score. Tu peux ensuite explorer les recommandations à ton rythme.",
  },
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
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Tout ce que tu dois savoir
        </motion.h2>
        <p className="mt-3 text-muted-foreground">Encore une hésitation ? On répond aux questions les plus fréquentes.</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col divide-y divide-border rounded-xl border border-border">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium marker:content-none">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
