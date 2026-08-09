"use client";

import { Check, Copy, MousePointerClick, TrendingUp, UserPlus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

interface Commission {
  amount_cents: number;
  commission_cents: number;
  status: "due" | "paid" | "void";
  created_at: string;
}

const STATUS_LABEL: Record<Commission["status"], string> = {
  due: "En attente",
  paid: "Payée",
  void: "Annulée",
};

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatPercent(numerator: number, denominator: number) {
  if (denominator === 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function AffiliateView({
  displayName,
  trackingUrl,
  commissionRate,
  clickCount,
  signupCount,
  saleCount,
  dueCents,
  paidCents,
  commissions,
}: {
  displayName: string | null;
  trackingUrl: string;
  commissionRate: number;
  clickCount: number;
  signupCount: number;
  saleCount: number;
  dueCents: number;
  paidCents: number;
  commissions: Commission[];
}) {
  const { copiedKey, copy } = useClipboardCopy();
  const copied = copiedKey === "affiliate-link";

  async function copyLink() {
    await copy(trackingUrl, "affiliate-link");
    track(AnalyticsEvent.AffiliateLinkCopied, {});
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {displayName ? `Salut ${displayName} 👋` : "Programme d'affiliation"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {Math.round(commissionRate * 100)}% de commission sur chaque vente que tu apportes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ton lien de tracking</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input readOnly value={trackingUrl} className="font-mono text-xs" />
          <Button variant="outline" onClick={copyLink} className="shrink-0">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copié" : "Copier"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={MousePointerClick} label="Clics" value={clickCount} />
        <StatCard
          icon={UserPlus}
          label="Inscriptions"
          value={signupCount}
          sub={`${formatPercent(signupCount, clickCount)} des clics`}
        />
        <StatCard
          icon={TrendingUp}
          label="Ventes"
          value={saleCount}
          sub={`${formatPercent(saleCount, signupCount)} des inscrits`}
        />
        <StatCard icon={Wallet} label="Commission due" value={formatEuros(dueCents)} />
      </div>

      {paidCents > 0 && (
        <p className="text-xs text-muted-foreground">
          Déjà versé : <span className="font-medium text-foreground">{formatEuros(paidCents)}</span>
        </p>
      )}

      {commissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des ventes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Vente</th>
                    <th className="px-4 py-3 text-left font-medium">Ta commission</th>
                    <th className="px-4 py-3 text-left font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">{formatEuros(c.amount_cents)}</td>
                      <td className="px-4 py-3 font-medium">{formatEuros(c.commission_cents)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === "paid" ? "default" : "secondary"}>
                          {STATUS_LABEL[c.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof MousePointerClick;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-5">
        <Icon className="size-4 text-primary" />
        <span className="text-xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
      </CardContent>
    </Card>
  );
}
