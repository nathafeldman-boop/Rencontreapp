"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** "flowri_té" -> "flowri-te" — strips accents (NFD + combining-mark range) before slugifying. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function ClaimInviteForm({ token, commissionRatePercent }: { token: string; commissionRatePercent: number }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDisplayNameChange(value: string) {
    setDisplayName(value);
    if (!codeTouched) setCode(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/affiliate/claim-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, displayName, code }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Impossible de valider ton inscription — réessaie.");
      setLoading(false);
      return;
    }

    router.push("/affilie");
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Rejoindre le programme d&apos;affiliation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {commissionRatePercent}% de commission sur chaque vente que tu apportes. Choisis un pseudo et ton lien de
          tracking pour finaliser ton inscription.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="displayName">Ton pseudo</Label>
            <Input
              id="displayName"
              required
              maxLength={60}
              placeholder="flowri_te"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="code">Ton lien de tracking</Label>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="shrink-0">flirtcraft.app/aff/</span>
              <Input
                id="code"
                required
                minLength={3}
                maxLength={32}
                pattern="[a-z0-9-]+"
                placeholder="flowri20"
                value={code}
                onChange={(e) => {
                  setCodeTouched(true);
                  setCode(e.target.value.toLowerCase());
                }}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !displayName.trim() || !code.trim()} className="mt-2">
            {loading ? <Loader2 className="animate-spin" /> : null}
            Créer mon lien d&apos;affiliation
          </Button>
        </form>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
