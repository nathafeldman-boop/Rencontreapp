"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

/** The only price we actually know in code — the annual price lives in Stripe, not here, so it has no preset. */
const PRESETS = [
  { label: "Mensuel — 7,99€", amount: "7.99" },
  { label: "Personnalisé", amount: "" },
] as const;

interface LtvCardProps {
  userId: string;
  initialTotalCents: number;
  hasStripeCustomer: boolean;
}

/** LTV total + "Enregistrer un paiement manqué" — for cash/off-platform payments Stripe has no invoice for. */
export function LtvCard({ userId, initialTotalCents, hasStripeCustomer }: LtvCardProps) {
  const [totalCents, setTotalCents] = useState(initialTotalCents);
  const [showForm, setShowForm] = useState(false);
  const [preset, setPreset] = useState<string>(PRESETS[0].label);
  const [amount, setAmount] = useState<string>(PRESETS[0].amount);
  const [paidAt, setPaidAt] = useState(todayIsoDate());
  const [affiliateCode, setAffiliateCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePresetChange(label: string) {
    setPreset(label);
    const found = PRESETS.find((p) => p.label === label);
    if (found) setAmount(found.amount);
  }

  async function record() {
    const euros = Number(amount.replace(",", "."));
    if (!Number.isFinite(euros) || euros <= 0) {
      setError("Montant invalide.");
      return;
    }

    setLoading(true);
    setError(null);
    const amountCents = Math.round(euros * 100);

    try {
      const res = await fetch(`/api/admin/users/${userId}/manual-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          note: note.trim() || undefined,
          paidAt: new Date(`${paidAt}T12:00:00`).toISOString(),
          affiliateCode: affiliateCode.trim() || undefined,
        }),
      });

      if (!res.ok) {
        setError("Impossible d'enregistrer le paiement — réessaie.");
        return;
      }

      setTotalCents((prev) => prev + amountCents);
      setPreset(PRESETS[0].label);
      setAmount(PRESETS[0].amount);
      setPaidAt(todayIsoDate());
      setAffiliateCode("");
      setNote("");
      setShowForm(false);
    } catch {
      setError("Une erreur est survenue — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">LTV — total encaissé</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-3xl font-semibold tracking-tight">{formatEuros(totalCents)}</p>
        {totalCents === 0 && <p className="text-sm text-muted-foreground">Aucun paiement encore</p>}
        {!hasStripeCustomer && totalCents > 0 && (
          <p className="text-xs text-muted-foreground">
            Montant issu de paiements enregistrés manuellement — ce compte n&apos;a pas de client Stripe réel.
          </p>
        )}

        {showForm ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">
              Rattrapage manuel — pour un paiement réel qui n&apos;a jamais créé de ligne côté Stripe.
            </p>
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {PRESETS.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Input
                placeholder="Montant (€)"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setPreset("Personnalisé");
                }}
                autoFocus
              />
              <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} max={todayIsoDate()} />
            </div>
            <Input
              placeholder="Slug affilié (optionnel)"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value)}
            />
            <Input placeholder="Note (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={record} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : null}
                Enregistrer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} disabled={loading}>
                Annuler
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-fit" onClick={() => setShowForm(true)}>
            <Plus className="size-3.5" />
            Enregistrer un paiement manqué
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
