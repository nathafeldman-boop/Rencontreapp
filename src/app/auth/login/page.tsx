"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Loader2, Mail } from "lucide-react";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = () =>
    `${window.location.origin}/auth/callback`;

  async function handleGoogleSignIn() {
    setError(null);
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl() },
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

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl() },
    });
    if (error) {
      setError(error.message);
      setStatus("idle");
    } else {
      // Comme pour Google — la complétion est trackée depuis /auth/callback
      // une fois le lien magique cliqué et la session créée.
      track(AnalyticsEvent.SignupStarted, { method: "email" });
      setStatus("sent");
    }
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

        {status === "sent" ? (
          <p className="rounded-lg bg-secondary p-4 text-sm text-secondary-foreground">
            Lien envoyé — vérifie ta boîte mail pour continuer.
          </p>
        ) : (
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
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
              M&apos;envoyer un lien de connexion
            </Button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </motion.div>
    </main>
  );
}
