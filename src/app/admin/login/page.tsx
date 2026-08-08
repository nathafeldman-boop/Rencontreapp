"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Code invalide.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Une erreur est survenue — vérifie ta connexion et réessaie.");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
          <KeyRound className="size-5" />
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight">Accès admin</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Entre ton code d&apos;accès partagé.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <Label htmlFor="code">Code d&apos;accès</Label>
          <Input
            id="code"
            autoFocus
            required
            autoComplete="off"
            placeholder="FC-XXXX-XXXX"
            className="text-center tracking-[0.15em]"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Button type="submit" disabled={loading || code.trim().length < 4}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Entrer
          </Button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </motion.div>
    </main>
  );
}
