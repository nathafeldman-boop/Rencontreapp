import { Camera, MessageCircle, Sparkles, Swords, CalendarCheck, Check, Minus, Trophy } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewTracker } from "@/components/dashboard/view-tracker";
import { UpgradeCta } from "@/components/premium/upgrade-cta";
import { AnalyticsEvent } from "@/lib/analytics/events";

const MONTHLY_TOOLS = [
  {
    icon: Camera,
    label: "Photo Optimizer",
    detail: "Notation illimitée photo par photo et conseils d'ordre, actualisés à chaque changement de photo.",
  },
  {
    icon: Sparkles,
    label: "Bio Generator",
    detail: "Bios générées par ton coach en illimité, adaptées à ton style, ton objectif et ton app de rencontre.",
  },
  {
    icon: MessageCircle,
    label: "Coach de conversation",
    detail: "Suggestions de réponses illimitées dans les modes Flirt, Drôle, Naturel et Confiant.",
  },
  {
    icon: Swords,
    label: "Simulateur de match",
    detail: "Entraîne-toi sur de vraies conversations avec un match simulé par ton coach et obtiens un bilan noté après chaque session.",
  },
  {
    icon: CalendarCheck,
    label: "Plan d'amélioration",
    detail: "Un plan personnalisé jour par jour qui s'adapte à ton objectif et à ton plus gros point de blocage.",
  },
  {
    icon: Trophy,
    label: "Suivi du score & badges",
    detail: "Historique complet du score, niveaux et badges au fil de l'amélioration de ton profil.",
  },
];

const COMPARISON_ROWS: { label: string; free: string | boolean; premium: string | boolean }[] = [
  { label: "Dating Score complet (photo, bio, attractivité, conversation)", free: true, premium: true },
  { label: "Toutes les recommandations de l'analyse", free: true, premium: true },
  { label: "Nouvelles analyses & suivi de la progression", free: "Une analyse", premium: "Illimité" },
  { label: "Photo Optimizer", free: false, premium: true },
  { label: "Bio Generator", free: false, premium: true },
  { label: "Coach de conversation (4 modes)", free: false, premium: true },
  { label: "Simulateur de match", free: false, premium: true },
  { label: "Plan d'amélioration personnalisé", free: false, premium: true },
  { label: "Historique du score, niveaux & badges", free: false, premium: true },
  { label: "Carte de Dating Score partageable", free: false, premium: true },
  { label: "Inviter des amis pour des récompenses", free: true, premium: true },
];

export default async function PremiumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const hasBillingAccount = Boolean(subscription?.stripe_customer_id);

  return (
    <div className="flex flex-col gap-8">
      <ViewTracker event={AnalyticsEvent.PaywallViewed} properties={{ trigger: "premium_page" }} />

      <div className="text-center">
        <Badge variant="accent">Premium</Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Tout ce que tu reçois, chaque mois</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un seul abonnement, cinq outils, et un coach qui s&apos;affine à chaque utilisation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MONTHLY_TOOLS.map((tool) => (
          <Card key={tool.label}>
            <CardContent className="flex gap-3 pt-6">
              <tool.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tool.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gratuit vs Premium</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Fonctionnalité</th>
                  <th className="px-4 py-3 text-center font-medium">Gratuit</th>
                  <th className="px-4 py-3 text-center font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ComparisonCell value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto w-full max-w-sm">
        <UpgradeCta hasBillingAccount={hasBillingAccount} />
        <p className="mt-3 text-center text-xs text-muted-foreground">Annulation à tout moment. Sans engagement.</p>
      </div>
    </div>
  );
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-primary" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}
