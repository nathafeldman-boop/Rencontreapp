"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ExternalLink, Loader2, Mail, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/shared/google-icon";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { androidEscapeUrl, detectInAppBrowser, detectMobilePlatform, type InAppBrowserApp } from "@/lib/utils/in-app-browser";

const APP_LABEL: Record<Exclude<InAppBrowserApp, null>, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
};

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

  // TikTok/Instagram in-app browsers routinely break "Continuer avec
  // Google" (Google blocks sign-in inside recognized embedded webviews) —
  // detect it so we can point people at the email code instead of letting
  // them hit a dead end with no explanation. Defaults to "not detected" so
  // the first client render matches the static server HTML.
  const [inAppApp, setInAppApp] = useState<InAppBrowserApp>(null);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value, no server equivalent to sync against
    setInAppApp(detectInAppBrowser(userAgent));
    setIsAndroid(detectMobilePlatform(userAgent) === "android");
  }, []);

  async function handleGoogleSignIn() {
    setError(null);
    setStatus("loading");
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirectTo) callbackUrl.searchParams.set("redirect_to", redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
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

            {inAppApp && (
              <div className="mt-4 flex flex-col gap-2 rounded-xl bg-secondary px-4 py-3 text-sm">
                <div className="flex items-start gap-2">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <p className="text-muted-foreground">
                    Tu es dans le navigateur intégré de {APP_LABEL[inAppApp]} — la connexion Google peut ne pas
                    fonctionner ici.{" "}
                    {isAndroid ? "Ouvre ce lien dans ton navigateur, ou utilise le code par email ci-dessous." : "Utilise plutôt le code par email ci-dessous, ou tape sur ⋯ en haut à droite puis « Ouvrir dans Safari »."}
                  </p>
                </div>
                {isAndroid && (
                  <a
                    href={androidEscapeUrl(typeof window !== "undefined" ? window.location.href : "")}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-background px-3 py-2 text-sm font-medium"
                  >
                    <ExternalLink className="size-3.5" />
                    Ouvrir dans le navigateur
                  </a>
                )}
              </div>
            )}

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
              On a envoyé un code à <span className="font-medium text-foreground">{email}</span>.
            </p>

            <form onSubmit={handleVerifyCode} className="mt-6 flex flex-col gap-3">
              <Label htmlFor="code">Code de connexion</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={8}
                placeholder="12345678"
                className="text-center text-lg tracking-[0.3em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              />
              <Button type="submit" disabled={status === "loading" || code.length < 6}>
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
