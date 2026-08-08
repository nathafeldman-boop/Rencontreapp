"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";

export interface AdminAccessCode {
  id: string;
  code: string;
  label: string | null;
  is_active: boolean;
  last_used_at: string | null;
}

export function AccessCodesPanel({ initialCodes }: { initialCodes: AdminAccessCode[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copiedKey, copy } = useClipboardCopy();

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || undefined }),
      });

      if (!res.ok) {
        setError("Impossible de générer un code — réessaie.");
        return;
      }

      const { data } = await res.json();
      setCodes((prev) => [
        { id: crypto.randomUUID(), code: data.code, label: label.trim() || null, is_active: true, last_used_at: null },
        ...prev,
      ]);
      setLabel("");
    } catch {
      setError("Une erreur est survenue — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Codes d&apos;accès</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {codes.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5"
            >
              <div>
                <p className="font-mono text-sm tracking-wide">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.label ?? "Sans nom"}
                  {" · "}
                  {c.last_used_at
                    ? `utilisé le ${new Date(c.last_used_at).toLocaleDateString("fr-FR")}`
                    : "jamais utilisé"}
                  {!c.is_active && " · désactivé"}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copy(c.code, c.id)}>
                {copiedKey === c.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nom (optionnel)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Button onClick={generate} disabled={loading} className="shrink-0">
            {loading ? <Loader2 className="animate-spin" /> : <Plus className="size-3.5" />}
            Générer
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
