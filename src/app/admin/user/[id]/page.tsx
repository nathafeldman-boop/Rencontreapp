import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Recommendation } from "@/types/database.types";

interface AdminUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("id, email, age, gender, country, dating_goal, dating_apps_used, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!user) {
    notFound();
  }

  const [
    { data: subscription },
    { data: onboardingAnswers },
    { data: profile },
    { data: analyses },
    { count: bioGenerationCount },
    { count: coachSessionCount },
    { count: simulatorSessionCount },
  ] = await Promise.all([
    admin
      .from("subscriptions")
      .select("plan, status, current_period_end, stripe_customer_id")
      .eq("user_id", id)
      .maybeSingle(),
    admin.from("onboarding_answers").select("question, answer").eq("user_id", id),
    admin
      .from("profiles")
      .select("bio, photos, dating_app, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("analyses")
      .select("overall_score, photo_score, bio_score, attractiveness_score, conversation_score, is_simulated, recommendations, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    admin.from("bio_generations").select("*", { count: "exact", head: true }).eq("user_id", id),
    admin.from("conversation_coach_sessions").select("*", { count: "exact", head: true }).eq("user_id", id),
    admin
      .from("match_simulator_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)
      .not("ended_at", "is", null),
  ]);

  const latest = analyses?.[0];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Dashboard admin
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{user.email}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Field label="Âge" value={user.age ?? "—"} />
          <Field label="Genre" value={user.gender ?? "—"} />
          <Field label="Localisation" value={user.country ?? "—"} />
          <Field label="Objectif" value={user.dating_goal ?? "—"} />
          <Field label="Apps utilisées" value={user.dating_apps_used?.join(", ") || "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{subscription?.plan ?? "free"}</span>
          <Badge variant={subscription?.status === "active" || subscription?.status === "trialing" ? "default" : "secondary"}>
            {subscription?.status ?? "aucun"}
          </Badge>
        </CardContent>
      </Card>

      {onboardingAnswers && onboardingAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {onboardingAnswers.map((a) => (
              <div key={a.question} className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{a.question}</span>
                <span className="font-medium">{a.answer}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">Bio</p>
            <p>{profile.bio || "—"}</p>
            <p className="mt-2 text-muted-foreground">
              {profile.photos?.length ?? 0} photo{(profile.photos?.length ?? 0) > 1 ? "s" : ""} · {profile.dating_app}
            </p>
          </CardContent>
        </Card>
      )}

      {latest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dernière analyse</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Field label="Global" value={`${latest.overall_score}/100`} />
              <Field label="Photos" value={`${latest.photo_score ?? "—"}`} />
              <Field label="Bio" value={`${latest.bio_score ?? "—"}`} />
              <Field label="Attractivité" value={`${latest.attractiveness_score ?? "—"}`} />
              <Field label="Conversation" value={`${latest.conversation_score ?? "—"}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              {latest.is_simulated ? "Fallback simulé (Mistral indisponible)" : "Analyse IA réelle"} ·{" "}
              {new Date(latest.created_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
            </p>
            {Array.isArray(latest.recommendations) && (latest.recommendations as Recommendation[]).length > 0 && (
              <ul className="mt-1 flex flex-col gap-1">
                {(latest.recommendations as Recommendation[]).slice(0, 3).map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    · {r.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {analyses && analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des scores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            {analyses.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-muted-foreground">
                <span>{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                <span className="font-medium text-foreground">{a.overall_score}/100</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage des outils IA</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <Field label="Bios générées" value={bioGenerationCount ?? 0} />
          <Field label="Sessions coach" value={coachSessionCount ?? 0} />
          <Field label="Simulations terminées" value={simulatorSessionCount ?? 0} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
