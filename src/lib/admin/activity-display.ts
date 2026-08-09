import { AnalyticsEvent, type AnalyticsEventName } from "@/lib/analytics/events";

/**
 * Pure display/grouping helpers for admin activity data — deliberately
 * free of server-only imports (Supabase admin client, Stripe) so client
 * components (e.g. the expandable session timeline) can import this
 * directly. Server-only data fetching (Stripe LTV, Supabase reads) lives
 * in lib/admin/activity.ts instead.
 */

const SESSION_GAP_MINUTES = 30;

export interface ActivityEvent {
  event: string;
  properties: Record<string, unknown>;
  occurredAt: string;
}

export interface ActivitySession {
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  events: ActivityEvent[];
}

/** French label for each known event key — falls back to the raw key for anything not in this map. */
const EVENT_LABELS: Partial<Record<AnalyticsEventName, string>> = {
  [AnalyticsEvent.LandingView]: "A visité la page d'accueil",
  [AnalyticsEvent.ClickStartAnalysis]: "A cliqué sur \"Commencer\"",
  [AnalyticsEvent.SignupStarted]: "A démarré l'inscription",
  [AnalyticsEvent.SignupCompleted]: "Compte créé",
  [AnalyticsEvent.LoggedIn]: "S'est connecté(e)",
  [AnalyticsEvent.OnboardingStarted]: "A démarré l'onboarding",
  [AnalyticsEvent.OnboardingCompleted]: "A terminé l'onboarding",
  [AnalyticsEvent.ProfileUploadStarted]: "A commencé à envoyer ses photos",
  [AnalyticsEvent.ProfileUploadCompleted]: "A envoyé ses photos",
  [AnalyticsEvent.AnalysisStarted]: "A lancé une analyse",
  [AnalyticsEvent.AnalysisCompleted]: "Analyse terminée",
  [AnalyticsEvent.PaywallViewed]: "A vu le paywall",
  [AnalyticsEvent.CheckoutStarted]: "A démarré le paiement",
  [AnalyticsEvent.SubscriptionCreated]: "Abonnement souscrit",
  [AnalyticsEvent.SubscriptionCanceled]: "Abonnement annulé",
  [AnalyticsEvent.DashboardViewed]: "A ouvert le dashboard",
  [AnalyticsEvent.AnalysisRepeated]: "A relancé une analyse",
  [AnalyticsEvent.AiCoachUsed]: "A utilisé le coach",
  [AnalyticsEvent.BioGenerated]: "A généré des bios",
  [AnalyticsEvent.BioApplied]: "A choisi une bio",
  [AnalyticsEvent.ConversationCoachUsed]: "A utilisé le coach de conversation",
  [AnalyticsEvent.PhotoOptimizerUsed]: "A modifié ses photos",
  [AnalyticsEvent.DatingPlanGenerated]: "A généré son plan",
  [AnalyticsEvent.DatingStatsAdded]: "A enregistré ses statistiques",
  [AnalyticsEvent.ReferralLinkCopied]: "A copié son lien de parrainage",
  [AnalyticsEvent.ReferralSignup]: "Inscrit(e) via parrainage",
  [AnalyticsEvent.ReferralRewardGranted]: "A gagné une récompense de parrainage",
  [AnalyticsEvent.ScoreShared]: "A partagé son score",
  [AnalyticsEvent.FeedbackSubmitted]: "A envoyé un avis",
};

export function labelForEvent(event: string): string {
  return EVENT_LABELS[event as AnalyticsEventName] ?? event;
}

/**
 * Groups events into sessions using a 30-minute-silence-starts-a-new-
 * session heuristic. `events` may be in any order; the result is sorted
 * most-recent-session-first, with events inside each session oldest-first
 * (reads top-to-bottom like a real timeline).
 */
export function groupIntoSessions(events: ActivityEvent[]): ActivitySession[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  const sessions: ActivitySession[] = [];

  for (const event of sorted) {
    const current = sessions[sessions.length - 1];
    const gapMs = current ? new Date(event.occurredAt).getTime() - new Date(current.endedAt).getTime() : Infinity;

    if (current && gapMs <= SESSION_GAP_MINUTES * 60 * 1000) {
      current.events.push(event);
      current.endedAt = event.occurredAt;
    } else {
      sessions.push({ startedAt: event.occurredAt, endedAt: event.occurredAt, durationMinutes: 0, events: [event] });
    }
  }

  for (const session of sessions) {
    const spanMinutes = (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60_000;
    session.durationMinutes = Math.max(1, Math.round(spanMinutes));
  }

  return sessions.reverse();
}

/** Best-effort human label for where a signup came from — see assign-landing-source-cookie.ts. */
export function classifyOrigin(
  referrerHost: string | null | undefined,
  creatorSlug?: string | null,
  referralCode?: string | null
): string {
  if (creatorSlug) return `Créateur — ${creatorSlug}`;
  if (referralCode) return "Parrainage";
  if (!referrerHost) return "Direct / inconnu";

  const host = referrerHost.replace(/^www\./, "");
  if (/(^|\.)google\./.test(host)) return "Extérieur — recherche Google";
  if (/(^|\.)(facebook|instagram|meta)\./.test(host)) return "Extérieur — Meta (Facebook/Instagram)";
  if (/(^|\.)tiktok\./.test(host)) return "Extérieur — TikTok";
  if (/(^|\.)(twitter|x)\.com$/.test(host)) return "Extérieur — X";
  if (/(^|\.)reddit\./.test(host)) return "Extérieur — Reddit";
  if (/(^|\.)youtube\./.test(host)) return "Extérieur — YouTube";
  return `Extérieur — ${host}`;
}
