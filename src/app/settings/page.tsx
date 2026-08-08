import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingCard } from "@/components/settings/billing-card";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { ReminderToggle } from "@/components/settings/reminder-toggle";
import { HobbiesEditor } from "@/components/settings/hobbies-editor";
import { ONBOARDING_QUESTIONS } from "@/lib/ai/user-context";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  email: "Code par email",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: subscription }, { data: userRow }, { data: hobbiesAnswer }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, stripe_customer_id")
      .eq("user_id", user?.id ?? "")
      .maybeSingle(),
    supabase.from("users").select("daily_reminder_enabled").eq("id", user?.id ?? "").maybeSingle(),
    supabase
      .from("onboarding_answers")
      .select("answer")
      .eq("user_id", user?.id ?? "")
      .eq("question", ONBOARDING_QUESTIONS.hobbies)
      .maybeSingle(),
  ]);

  const provider = user?.app_metadata?.provider as string | undefined;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Réglages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ton compte et ton abonnement.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bio, photos et informations personnelles se gèrent depuis ton profil et l&apos;optimisation.
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <Link href="/dashboard/profile" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Voir mon profil
              <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/dashboard/optimize" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Modifier ma bio et mes photos
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Centres d&apos;intérêt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Tes hobbys, ton métier, ce que tu fais dans la vie — utilisés par l&apos;IA pour personnaliser tes
            bios, réponses et conseils au lieu d&apos;inventer des détails.
          </p>
          <HobbiesEditor initialHobbies={hobbiesAnswer?.answer ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rappels</CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderToggle initialEnabled={userRow?.daily_reminder_enabled ?? false} />
        </CardContent>
      </Card>

      <BillingCard
        plan={subscription?.plan ?? null}
        status={subscription?.status ?? null}
        currentPeriodEnd={subscription?.current_period_end ?? null}
        hasBillingAccount={Boolean(subscription?.stripe_customer_id)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connexion via {provider ? (PROVIDER_LABEL[provider] ?? provider) : "email"}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Données</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tes photos, ta bio et tes analyses restent privées et servent uniquement à générer tes résultats. Pour
            toute demande d&apos;accès, de rectification ou de suppression de tes données, consulte nos{" "}
            <Link href="/mentions-legales" className="underline underline-offset-2 hover:text-foreground">
              mentions légales
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Déconnexion</CardTitle>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
