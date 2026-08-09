import Link from "next/link";
import { ArrowRight, CircleDollarSign, Sparkles, TrendingUp, Users } from "lucide-react";

import { requireAdminSession, listOnlineAdmins } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardActivityStats } from "@/lib/admin/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/admin/sparkline";
import { TrendBadge } from "@/components/admin/trend-badge";
import { LogoutButton } from "@/components/admin/logout-button";
import { AccessCodesPanel } from "@/components/admin/access-codes-panel";
import { AffiliatesPanel, type AdminAffiliate, type AdminAffiliateInvite } from "@/components/admin/affiliates-panel";
import type { DailyPoint } from "@/lib/admin/dashboard-stats";

const MONTHLY_PRICE = 7.99;

const VISITORS_COLOR = "oklch(0.62 0.16 250)";
const SIGNUPS_COLOR = "oklch(0.6 0.2 300)";
const PURCHASES_COLOR = "oklch(0.64 0.17 150)";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: totalProfiles },
    { count: totalAnalyses },
    { count: realAnalyses },
    { count: activeSubs },
    { data: recentUsers },
    { data: accessCodes },
    { data: affiliates },
    { data: affiliateClicks },
    { data: affiliateReferrals },
    { data: affiliateCommissions },
    { data: pendingInvites },
    onlineAdmins,
    activity,
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("analyses").select("*", { count: "exact", head: true }),
    admin.from("analyses").select("*", { count: "exact", head: true }).eq("is_simulated", false),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).in("status", ["active", "trialing"]),
    admin.from("users").select("id, email, created_at").order("created_at", { ascending: false }).limit(20),
    admin
      .from("admin_access_codes")
      .select("id, code, label, is_active, last_used_at")
      .order("created_at", { ascending: false }),
    admin
      .from("affiliates")
      .select("id, user_id, code, commission_rate, active, display_name, created_at")
      .order("created_at", { ascending: false }),
    admin.from("affiliate_clicks").select("affiliate_id"),
    admin.from("affiliate_referrals").select("affiliate_id"),
    admin.from("affiliate_commissions").select("affiliate_id, commission_cents, status"),
    admin
      .from("affiliate_invites")
      .select("id, token, label, commission_rate")
      .is("used_at", null)
      .order("created_at", { ascending: false }),
    listOnlineAdmins(),
    getDashboardActivityStats(admin),
  ]);

  const recentUserIds = (recentUsers ?? []).map((u) => u.id);
  const [{ data: recentSubs }, { data: recentAnalyses }] =
    recentUserIds.length > 0
      ? await Promise.all([
          admin.from("subscriptions").select("user_id, status").in("user_id", recentUserIds),
          admin
            .from("analyses")
            .select("user_id, overall_score, created_at")
            .in("user_id", recentUserIds)
            .order("created_at", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];

  const affiliateUserIds = (affiliates ?? []).map((a) => a.user_id);
  const { data: affiliateUsers } =
    affiliateUserIds.length > 0
      ? await admin.from("users").select("id, email").in("id", affiliateUserIds)
      : { data: [] };
  const emailByUserId = new Map((affiliateUsers ?? []).map((u) => [u.id, u.email]));

  const clicksByAffiliate = new Map<string, number>();
  for (const c of affiliateClicks ?? []) clicksByAffiliate.set(c.affiliate_id, (clicksByAffiliate.get(c.affiliate_id) ?? 0) + 1);

  const signupsByAffiliate = new Map<string, number>();
  for (const r of affiliateReferrals ?? [])
    signupsByAffiliate.set(r.affiliate_id, (signupsByAffiliate.get(r.affiliate_id) ?? 0) + 1);

  const salesByAffiliate = new Map<string, number>();
  const dueByAffiliate = new Map<string, number>();
  const paidByAffiliate = new Map<string, number>();
  for (const c of affiliateCommissions ?? []) {
    salesByAffiliate.set(c.affiliate_id, (salesByAffiliate.get(c.affiliate_id) ?? 0) + 1);
    if (c.status === "due") dueByAffiliate.set(c.affiliate_id, (dueByAffiliate.get(c.affiliate_id) ?? 0) + c.commission_cents);
    if (c.status === "paid") paidByAffiliate.set(c.affiliate_id, (paidByAffiliate.get(c.affiliate_id) ?? 0) + c.commission_cents);
  }

  const adminAffiliates: AdminAffiliate[] = (affiliates ?? []).map((a) => ({
    id: a.id,
    code: a.code,
    email: emailByUserId.get(a.user_id) ?? "—",
    displayName: a.display_name,
    commissionRate: a.commission_rate,
    active: a.active,
    clickCount: clicksByAffiliate.get(a.id) ?? 0,
    signupCount: signupsByAffiliate.get(a.id) ?? 0,
    saleCount: salesByAffiliate.get(a.id) ?? 0,
    dueCents: dueByAffiliate.get(a.id) ?? 0,
    paidCents: paidByAffiliate.get(a.id) ?? 0,
  }));

  const adminInvites: AdminAffiliateInvite[] = (pendingInvites ?? []).map((i) => ({
    id: i.id,
    token: i.token,
    label: i.label,
    commissionRate: i.commission_rate,
  }));

  const subByUser = new Map((recentSubs ?? []).map((s) => [s.user_id, s.status]));
  const latestScoreByUser = new Map<string, number>();
  for (const a of recentAnalyses ?? []) {
    if (!latestScoreByUser.has(a.user_id)) latestScoreByUser.set(a.user_id, a.overall_score);
  }

  const mrr = (activeSubs ?? 0) * MONTHLY_PRICE;
  const premiumPct = totalUsers ? Math.round(((activeSubs ?? 0) / totalUsers) * 100) : 0;
  const landingToSignupStep = activity.funnel[0];
  const signupStep = activity.funnel[1];
  const landingToSignupPct =
    landingToSignupStep && landingToSignupStep.count > 0 && signupStep
      ? Math.round((signupStep.count / landingToSignupStep.count) * 100)
      : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Flirtcraft</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connecté en tant que {session.label ?? "Admin"}
            {onlineAdmins.length > 1 && (
              <span> · {onlineAdmins.map((o) => o.label).join(", ")} en ligne</span>
            )}
          </p>
        </div>
        <LogoutButton />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Aujourd&apos;hui</h2>
          <span className="text-xs text-muted-foreground">Recalculé à chaque chargement de page</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TodayStatCard
            label="Visiteurs"
            sublabel="ont vu la landing"
            value={activity.today.visitors}
            series={activity.series.visitors}
            color={VISITORS_COLOR}
          />
          <TodayStatCard
            label="Nouveaux inscrits"
            sublabel="ont créé un compte"
            value={activity.today.signups}
            series={activity.series.signups}
            color={SIGNUPS_COLOR}
          />
          <TodayStatCard
            label="Achats payants"
            sublabel="nouveaux abonnements"
            value={activity.today.purchases}
            series={activity.series.purchases}
            color={PURCHASES_COLOR}
          />
        </div>
      </section>

      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Visiteurs — 7 derniers jours</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{activity.weekOverWeek.thisWeek}</p>
            <p className="text-xs text-muted-foreground">était {activity.weekOverWeek.lastWeek} la semaine d&apos;avant</p>
          </div>
          <TrendBadge deltaPct={activity.weekOverWeek.deltaPct} />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Clients</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Users} label="Inscrits au total" value={totalUsers ?? 0} />
          <StatCard icon={TrendingUp} label="Clients premium" value={`${activeSubs ?? 0} (${premiumPct}%)`} />
          <StatCard icon={Sparkles} label="Analyses (IA réelle)" value={`${realAnalyses ?? 0} / ${totalAnalyses ?? 0}`} />
          <StatCard icon={CircleDollarSign} label="MRR estimé" value={`${mrr.toFixed(2)}€`} />
        </div>
        <Card>
          <CardContent className="flex flex-col gap-1 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Landing → inscription (30 derniers jours)</span>
              <span className="font-medium">{landingToSignupPct !== null ? `${landingToSignupPct}%` : "—"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              sur {landingToSignupStep?.count ?? 0} visiteurs distincts, {totalProfiles ?? 0} profils créés au total
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funnel — 30 derniers jours</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activity.funnel.map((step) => (
            <div key={step.event}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{step.label}</span>
                <span className="font-medium tabular-nums">
                  {step.count} <span className="text-xs text-muted-foreground">({step.pctOfFirst}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${step.pctOfFirst}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rétention &amp; engagement</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col gap-1 py-4">
              <span className="text-2xl font-semibold tabular-nums">{activity.activeToday}</span>
              <span className="text-xs text-muted-foreground">actifs aujourd&apos;hui</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-1 py-4">
              <span className="text-2xl font-semibold tabular-nums">{activity.activeThisWeek}</span>
              <span className="text-xs text-muted-foreground">actifs cette semaine</span>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilisateurs actifs par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline points={activity.dailyActiveUsers} color={VISITORS_COLOR} className="h-16 w-full" />
            <p className="mt-2 text-xs text-muted-foreground">Courbe = 14 derniers jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outils utilisés (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {activity.toolUsage.map((tool) => (
              <div key={tool.label}>
                <p className="text-xl font-semibold tabular-nums">{tool.count}</p>
                <p className="text-xs text-muted-foreground">{tool.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Derniers inscrits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Inscrit le</th>
                  <th className="px-4 py-3 text-left font-medium">Score</th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {(recentUsers ?? []).map((u) => {
                  const status = subByUser.get(u.id);
                  const score = latestScoreByUser.get(u.id);
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="max-w-[180px] truncate px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">{score ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status === "active" || status === "trialing" ? "default" : "secondary"}>
                          {status ?? "free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/user/${u.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Voir
                          <ArrowRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AffiliatesPanel initialAffiliates={adminAffiliates} initialInvites={adminInvites} />

      <AccessCodesPanel initialCodes={accessCodes ?? []} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-5">
        <Icon className="size-4 text-primary" />
        <span className="text-xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function TodayStatCard({
  label,
  sublabel,
  value,
  series,
  color,
}: {
  label: string;
  sublabel: string;
  value: number;
  series: DailyPoint[];
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-5">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{sublabel}</span>
        <Sparkline points={series} color={color} className="mt-2 h-8 w-full" />
      </CardContent>
    </Card>
  );
}
