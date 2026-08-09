import type { SupabaseClient } from "@supabase/supabase-js";

import { AnalyticsEvent } from "@/lib/analytics/events";
import type { Database } from "@/types/database.types";

export interface DailyPoint {
  date: string;
  value: number;
}

export interface FunnelStep {
  label: string;
  event: string;
  count: number;
  pctOfFirst: number;
}

export interface ToolUsageRow {
  label: string;
  count: number;
}

export interface DashboardActivityStats {
  today: { visitors: number; signups: number; purchases: number };
  /** Last 8 days, oldest first, for the sparkline under each "today" number. */
  series: { visitors: DailyPoint[]; signups: DailyPoint[]; purchases: DailyPoint[] };
  weekOverWeek: { thisWeek: number; lastWeek: number; deltaPct: number | null };
  /** Landing page -> paying subscriber, last 30 days, by distinct visitor identity (anon_id before signup, user_id after). */
  funnel: FunnelStep[];
  activeToday: number;
  activeThisWeek: number;
  /** Last 14 days, oldest first. */
  dailyActiveUsers: DailyPoint[];
  toolUsage: ToolUsageRow[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SERIES_DAYS = 8;
const FUNNEL_WINDOW_DAYS = 30;
const DAU_WINDOW_DAYS = 14;

const FUNNEL_DEFINITION: { label: string; event: string }[] = [
  { label: "Vu la landing", event: AnalyticsEvent.LandingView },
  { label: "Inscrits", event: AnalyticsEvent.SignupCompleted },
  { label: "Onboarding terminé", event: AnalyticsEvent.OnboardingCompleted },
  { label: "Photos envoyées", event: AnalyticsEvent.ProfileUploadCompleted },
  { label: "Analyse reçue", event: AnalyticsEvent.AnalysisCompleted },
  { label: "Paywall vu", event: AnalyticsEvent.PaywallViewed },
  { label: "Paiement démarré", event: AnalyticsEvent.CheckoutStarted },
  { label: "Abonné", event: AnalyticsEvent.SubscriptionCreated },
];

const TOOL_USAGE_DEFINITION: { label: string; event: string }[] = [
  { label: "Coach conversation", event: AnalyticsEvent.ConversationCoachUsed },
  { label: "Générateur de bio", event: AnalyticsEvent.BioGenerated },
  { label: "Optimiseur photo", event: AnalyticsEvent.PhotoOptimizerUsed },
  { label: "Plan de progression", event: AnalyticsEvent.DatingPlanGenerated },
];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(Date.now() - i * DAY_MS).toISOString()));
  }
  return keys;
}

function identityOf(row: { user_id: string | null; anon_id: string | null }): string | null {
  return row.user_id ?? row.anon_id;
}

/**
 * Everything on /admin that's driven by activity_events (funnel-from-the-
 * landing-page, daily series, retention) — one query over the last 30 days,
 * sliced every way the dashboard needs it. Kept separate from the
 * lifetime `users`/`subscriptions`/`onboarding_answers` counts in
 * /admin/page.tsx: activity_events tracking only starts the moment
 * migration 0010 shipped (and anonymous pre-signup rows only since 0017),
 * so it's a recent-window view, not a source of truth for all-time totals.
 */
export async function getDashboardActivityStats(
  admin: SupabaseClient<Database>
): Promise<DashboardActivityStats> {
  const since = new Date(Date.now() - FUNNEL_WINDOW_DAYS * DAY_MS).toISOString();

  const { data } = await admin
    .from("activity_events")
    .select("event, user_id, anon_id, occurred_at")
    .gte("occurred_at", since);

  const rows = data ?? [];

  const seriesDayKeys = lastNDayKeys(SERIES_DAYS);
  const dauDayKeys = lastNDayKeys(DAU_WINDOW_DAYS);
  const todayKey = seriesDayKeys[seriesDayKeys.length - 1];
  const thisWeekKeys = new Set(lastNDayKeys(7));
  const lastWeekKeys = new Set(
    Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() - (7 + i) * DAY_MS).toISOString()))
  );

  function buildSeries(event: string): DailyPoint[] {
    const counts = new Map<string, number>();
    for (const row of rows) {
      if (row.event !== event) continue;
      const key = dayKey(row.occurred_at);
      if (!seriesDayKeys.includes(key)) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return seriesDayKeys.map((date) => ({ date, value: counts.get(date) ?? 0 }));
  }

  const visitorSeries = buildSeries(AnalyticsEvent.LandingView);
  const signupSeries = buildSeries(AnalyticsEvent.SignupCompleted);
  const purchaseSeries = buildSeries(AnalyticsEvent.SubscriptionCreated);

  let thisWeekVisitors = 0;
  let lastWeekVisitors = 0;
  for (const row of rows) {
    if (row.event !== AnalyticsEvent.LandingView) continue;
    const key = dayKey(row.occurred_at);
    if (thisWeekKeys.has(key)) thisWeekVisitors++;
    else if (lastWeekKeys.has(key)) lastWeekVisitors++;
  }

  const funnelIdentities = new Map<string, Set<string>>();
  for (const step of FUNNEL_DEFINITION) funnelIdentities.set(step.event, new Set());
  const activeIdentitiesByDay = new Map<string, Set<string>>();
  const activeUsersToday = new Set<string>();
  const activeUsersThisWeek = new Set<string>();
  const toolUsageCounts = new Map<string, Set<string>>();
  for (const tool of TOOL_USAGE_DEFINITION) toolUsageCounts.set(tool.event, new Set());

  for (const row of rows) {
    const identity = identityOf(row);
    if (!identity) continue;

    const set = funnelIdentities.get(row.event);
    if (set) set.add(identity);

    const toolSet = toolUsageCounts.get(row.event);
    if (toolSet) toolSet.add(identity);

    if (row.user_id) {
      const key = dayKey(row.occurred_at);
      if (dauDayKeys.includes(key)) {
        if (!activeIdentitiesByDay.has(key)) activeIdentitiesByDay.set(key, new Set());
        activeIdentitiesByDay.get(key)!.add(row.user_id);
      }
      if (key === todayKey) activeUsersToday.add(row.user_id);
      if (thisWeekKeys.has(key)) activeUsersThisWeek.add(row.user_id);
    }
  }

  const firstStepCount = funnelIdentities.get(FUNNEL_DEFINITION[0].event)?.size ?? 0;
  const funnel: FunnelStep[] = FUNNEL_DEFINITION.map((step) => {
    const count = funnelIdentities.get(step.event)?.size ?? 0;
    return {
      label: step.label,
      event: step.event,
      count,
      pctOfFirst: firstStepCount > 0 ? Math.round((count / firstStepCount) * 100) : 0,
    };
  });

  const toolUsage: ToolUsageRow[] = TOOL_USAGE_DEFINITION.map((tool) => ({
    label: tool.label,
    count: toolUsageCounts.get(tool.event)?.size ?? 0,
  }));

  return {
    today: {
      visitors: visitorSeries[visitorSeries.length - 1]?.value ?? 0,
      signups: signupSeries[signupSeries.length - 1]?.value ?? 0,
      purchases: purchaseSeries[purchaseSeries.length - 1]?.value ?? 0,
    },
    series: { visitors: visitorSeries, signups: signupSeries, purchases: purchaseSeries },
    weekOverWeek: {
      thisWeek: thisWeekVisitors,
      lastWeek: lastWeekVisitors,
      deltaPct: lastWeekVisitors > 0 ? Math.round(((thisWeekVisitors - lastWeekVisitors) / lastWeekVisitors) * 100) : null,
    },
    funnel,
    activeToday: activeUsersToday.size,
    activeThisWeek: activeUsersThisWeek.size,
    dailyActiveUsers: dauDayKeys.map((date) => ({ date, value: activeIdentitiesByDay.get(date)?.size ?? 0 })),
    toolUsage,
  };
}
