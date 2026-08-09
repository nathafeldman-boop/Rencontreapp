"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";

export interface AdminAffiliate {
  id: string;
  code: string;
  email: string;
  commissionRate: number;
  active: boolean;
  clickCount: number;
  signupCount: number;
  saleCount: number;
  dueCents: number;
  paidCents: number;
}

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function AffiliatesPanel({ initialAffiliates }: { initialAffiliates: AdminAffiliate[] }) {
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [rate, setRate] = useState("60");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { copiedKey, copy } = useClipboardCopy();

  async function createAffiliate() {
    setLoading(true);
    setError(null);

    try {
      const ratePercent = Number(rate);
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          commissionRatePercent: Number.isFinite(ratePercent) ? ratePercent : undefined,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Impossible de créer l'affilié — réessaie.");
        return;
      }

      setAffiliates((prev) => [
        {
          id: body.data.affiliate.id,
          code: body.data.affiliate.code,
          email: email.trim(),
          commissionRate: body.data.affiliate.commission_rate,
          active: body.data.affiliate.active,
          clickCount: 0,
          signupCount: 0,
          saleCount: 0,
          dueCents: 0,
          paidCents: 0,
        },
        ...prev,
      ]);
      setEmail("");
      setCode("");
      setRate("60");
    } catch {
      setError("Une erreur est survenue — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, nextActive: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      if (res.ok) {
        setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, active: nextActive } : a)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function markPaid(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markCommissionsPaid: true }),
      });
      if (res.ok) {
        setAffiliates((prev) =>
          prev.map((a) => (a.id === id ? { ...a, paidCents: a.paidCents + a.dueCents, dueCents: 0 } : a))
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Programme d&apos;affiliation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {affiliates.map((a) => {
            const copyKey = `aff-${a.id}`;
            return (
              <div key={a.id} className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.email}</p>
                    <p className="text-xs text-muted-foreground">
                      /aff/{a.code} · {Math.round(a.commissionRate * 100)}%
                      {!a.active && " · désactivé"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => copy(`${window.location.origin}/aff/${a.code}`, copyKey)}>
                      {copiedKey === copyKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === a.id}
                      onClick={() => toggleActive(a.id, !a.active)}
                    >
                      {a.active ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{a.clickCount} clics</span>
                  <span>{a.signupCount} inscriptions</span>
                  <span>{a.saleCount} ventes</span>
                  <span className="font-medium text-foreground">{formatEuros(a.dueCents)} dû</span>
                  {a.paidCents > 0 && <span>{formatEuros(a.paidCents)} versé</span>}
                  {a.dueCents > 0 && (
                    <Button size="sm" variant="ghost" className="h-6 px-2" disabled={busyId === a.id} onClick={() => markPaid(a.id)}>
                      {busyId === a.id ? <Loader2 className="size-3 animate-spin" /> : "Marquer payé"}
                    </Button>
                  )}
                </div>

                {a.dueCents > 0 && (
                  <Badge variant="accent" className="w-fit">
                    {formatEuros(a.dueCents)} à verser
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
          <Input placeholder="Email du compte Flirtcraft" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Code (ex: flowri20)" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input
            placeholder="% commission"
            type="number"
            min={1}
            max={100}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="sm:w-32"
          />
          <Button onClick={createAffiliate} disabled={loading || !email.trim() || !code.trim()} className="shrink-0">
            {loading ? <Loader2 className="animate-spin" /> : <Plus className="size-3.5" />}
            Ajouter
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
