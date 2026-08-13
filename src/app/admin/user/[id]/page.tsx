import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActivityEvents, computeLtv } from "@/lib/admin/activity";
import { groupIntoSessions, classifyOrigin } from "@/lib/admin/activity-display";
import { ONBOARDING_QUESTION_LABELS_FR } from "@/lib/ai/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LtvCard } from "@/components/admin/ltv-card";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
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
    .select("id, email, age, gender, country, dating_goal, dating_apps_used, signup_referrer, signup_utm_source, created_at")
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
    { data: authUser },
    activityEvents,
  ] = await Promise.all([
    admin
      .from("subscriptions")
      .select("plan, status, current_period_end, stripe_customer_id")
      .eq("user_id", id)
      .maybeSingle(),
    admin.from("onboarding_answers").select("question, answer, created_at").eq("user_id", id).order("created_at", { ascending: true }),
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
    admin.auth.admin.getUserById(id),
    getActivityEvents(admin, id),
  ]);

  // Prefer the latest real analysis for the headline card — a Mistral-outage
  // fallback happening to be the newest row shouldn't present fabricated
  // scores as this user's current state. Falls back to whatever exists if
  // every analysis on record is simulated.
  const latest = analyses?.find((a) => !a.is_simulated) ?? analyses?.[0];
  const ltv = await computeLtv(admin, id, subscription?.stripe_customer_id);
  const sessions = groupIntoSessions(activityEvents);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const lastActivityAt = sessions[0]?.endedAt;

  const referralCode = activityEvents.find((e) => e.event === "signup_completed")?.properties.referral_code as
    | string
    | undefined;
  const creatorSlug = activityEvents.find((e) => e.event === "signup_completed")?.properties.creator_slug as
    | string
    | undefined;
  const origin = classifyOrigin(user.signup_referrer, creatorSlug, referralCode ?? undefined);

  const displayName =
    (authUser?.user?.user_metadata?.full_name as string | undefined) ||
    (authUser?.user?.user_metadata?.name as string | undefined) ||
    user.email;

  const isPremium = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Tableau de bord
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.email} · inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })} ·{" "}
          {isPremium ? "Premium" : "Gratuit"}
        </p>
      </div>

      <LtvCard userId={id} initialTotalCents={ltv.totalCents} hasStripeCustomer={ltv.hasStripeCustomer} />

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <p className="text-xs text-muted-foreground">
            Tout ce qui suit vient de la navigation réellement enregistrée (aucun contenu de message ou de note
            n&apos;est jamais lu ici — juste quelle action, où, et quand). Le suivi par compte a démarré avec cette
            page : les visites antérieures à sa mise en ligne n&apos;apparaissent pas.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Field label="Origine" value={origin} />
            <Field
              label="Dernière activité"
              value={lastActivityAt ? new Date(lastActivityAt).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "—"}
            />
            <Field label="Sessions détectées" value={sessions.length} />
            <Field label="Temps total" value={totalMinutes > 0 ? `≈ ${totalMinutes} min` : "—"} />
          </div>
        </CardContent>
      </Card>

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
          <Badge variant={isPremium ? "default" : "secondary"}>{subscription?.status ?? "aucun"}</Badge>
        </CardContent>
      </Card>

      {onboardingAnswers && onboardingAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil &amp; intentions (questionnaire d&apos;accueil)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {
              // Onboarding can be re-submitted (test accounts, retries) and
              // inserts new rows rather than upserting — dedupe to the most
              // recent answer per question (rows arrive ordered by
              // created_at ascending, so a later entry always overwrites).
              Array.from(new Map(onboardingAnswers.map((a) => [a.question, a])).values()).map((a) => (
                <div key={a.question} className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">{ONBOARDING_QUESTION_LABELS_FR[a.question] ?? a.question}</span>
                  <span className="font-medium">{a.answer}</span>
                </div>
              ))
            }
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
              {latest.is_simulated ? "Fallback simulé (Mistral indisponible)" : "Analyse réelle"} ·{" "}
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
                <span className="flex items-center gap-1.5">
                  {new Date(a.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  {a.is_simulated && (
                    <Badge variant="secondary" className="text-[10px]">
                      Fallback simulé
                    </Badge>
                  )}
                </span>
                <span className={`font-medium ${a.is_simulated ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {a.overall_score}/100
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage des outils</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <Field label="Bios générées" value={bioGenerationCount ?? 0} />
          <Field label="Sessions coach" value={coachSessionCount ?? 0} />
          <Field label="Simulations terminées" value={simulatorSessionCount ?? 0} />
        </CardContent>
      </Card>

      <ActivityTimeline sessions={sessions} />
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
