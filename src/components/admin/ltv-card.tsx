"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

interface LtvCardProps {
  userId: string;
  initialTotalCents: number;
  hasStripeCustomer: boolean;
}

/** LTV total + "Enregistrer un paiement manqué" — for cash/off-platform payments Stripe has no invoice for. */
export function LtvCard({ userId, initialTotalCents, hasStripeCustomer }: LtvCardProps) {
  const [totalCents, setTotalCents] = useState(initialTotalCents);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ amountCents, note: note.trim() || undefined }),
      });

      if (!res.ok) {
        setError("Impossible d'enregistrer le paiement — réessaie.");
        return;
      }

      setTotalCents((prev) => prev + amountCents);
      setAmount("");
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
            <div className="flex gap-2">
              <Input
                placeholder="Montant (€)"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
              <Input placeholder="Note (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
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
