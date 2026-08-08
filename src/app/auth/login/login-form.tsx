"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/shared/google-icon";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

/**
 * Single choke point for signup — every CTA on the site routes here
 * (landing, SEO pages, blog), so gating it here disables signup
 * everywhere without touching each CTA individually.
 */
const SIGNUP_ENABLED = true;

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setStatus("idle");
    } else {
      // La session n'est établie qu'au retour sur /auth/callback —
      // `signup_completed` est déclenché depuis là-bas (côté serveur).
      track(AnalyticsEvent.SignupStarted, { method: "google" });
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
      setStatus("idle");
    } else {
      track(AnalyticsEvent.SignupStarted, { method: "email" });
      setStep("code");
      setStatus("idle");
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: code, redirectTo }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Code invalide ou expiré — réessaie.");
      setStatus("idle");
      return;
    }

    // signup_completed est déclenché côté serveur dans /api/auth/verify-otp.
    const { data } = await res.json();
    router.push(data.redirectTo);
  }

  if (!SIGNUP_ENABLED) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Clock className="size-5" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">On revient très vite</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Les inscriptions sont temporairement fermées le temps d&apos;une mise à jour.
            Reviens dans quelques instants.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        {step === "email" ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Crée ton compte</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gratuit. Ton analyse démarre juste après.
            </p>

            <Button
              variant="outline"
              className="mt-6 w-full"
              onClick={handleGoogleSignIn}
              disabled={status === "loading"}
            >
              {status === "loading" ? <Loader2 className="animate-spin" /> : <GoogleIcon className="size-4" />}
              Continuer avec Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              ou
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSendCode} className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="toi@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="secondary" disabled={status === "loading"}>
                {status === "loading" ? <Loader2 className="animate-spin" /> : <Mail />}
                M&apos;envoyer un code de connexion
              </Button>
            </form>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Retour
            </button>

            <h1 className="mt-4 text-xl font-semibold tracking-tight">Entre ton code</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              On a envoyé un code à 6 chiffres à <span className="font-medium text-foreground">{email}</span>.
            </p>

            <form onSubmit={handleVerifyCode} className="mt-6 flex flex-col gap-3">
              <Label htmlFor="code">Code de connexion</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="123456"
                className="text-center text-lg tracking-[0.3em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <Button type="submit" disabled={status === "loading" || code.length !== 6}>
                {status === "loading" ? <Loader2 className="animate-spin" /> : null}
                Valider le code
              </Button>
            </form>
          </>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </motion.div>
    </main>
  );
}
