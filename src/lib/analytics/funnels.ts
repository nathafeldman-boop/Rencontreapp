import { AnalyticsEvent, type AnalyticsEventName } from "@/lib/analytics/events";

/**
 * Reference funnel definitions — not executed in-app, just the canonical
 * event sequences to paste into PostHog Insights (Funnels tab) so
 * conversion-rate reporting stays consistent with how events are actually
 * fired. See README "Analytics & tracking" for how each rate maps to a
 * business question.
 */
export const ACQUISITION_FUNNEL: AnalyticsEventName[] = [
  AnalyticsEvent.LandingView,
  AnalyticsEvent.ClickStartAnalysis,
  AnalyticsEvent.SignupStarted,
  AnalyticsEvent.SignupCompleted,
];

export const ACTIVATION_FUNNEL: AnalyticsEventName[] = [
  AnalyticsEvent.SignupCompleted,
  AnalyticsEvent.OnboardingStarted,
  AnalyticsEvent.OnboardingCompleted,
  AnalyticsEvent.ProfileUploadStarted,
  AnalyticsEvent.ProfileUploadCompleted,
  AnalyticsEvent.AnalysisStarted,
  AnalyticsEvent.AnalysisCompleted,
];

export const CONVERSION_FUNNEL: AnalyticsEventName[] = [
  AnalyticsEvent.AnalysisCompleted,
  AnalyticsEvent.PaywallViewed,
  AnalyticsEvent.CheckoutStarted,
  AnalyticsEvent.SubscriptionCreated,
];

/**
 * Not a linear funnel — a set of events to trend weekly (in PostHog: Trends,
 * one series per event, unique users). A subscriber who never re-appears in
 * any of these after their first week is a churn-risk signal, since
 * `subscription_created` alone doesn't tell you whether they came back.
 */
export const RETENTION_EVENTS: AnalyticsEventName[] = [
  AnalyticsEvent.DashboardViewed,
  AnalyticsEvent.AnalysisRepeated,
  AnalyticsEvent.AiCoachUsed,
  AnalyticsEvent.BioGenerated,
  AnalyticsEvent.ConversationCoachUsed,
  AnalyticsEvent.PhotoOptimizerUsed,
  AnalyticsEvent.DatingPlanGenerated,
];

/**
 * Named "well-known" funnel questions -> the two events PostHog needs for a
 * simple two-step conversion-rate insight.
 */
export const KEY_CONVERSION_RATES: { label: string; steps: [AnalyticsEventName, AnalyticsEventName] }[] = [
  { label: "Landing -> signup", steps: [AnalyticsEvent.LandingView, AnalyticsEvent.SignupCompleted] },
  { label: "Signup -> analysis", steps: [AnalyticsEvent.SignupCompleted, AnalyticsEvent.AnalysisCompleted] },
  { label: "Analysis -> payment", steps: [AnalyticsEvent.AnalysisCompleted, AnalyticsEvent.SubscriptionCreated] },
];

/**
 * Churn isn't a PostHog event ratio — `subscription_canceled` (fired
 * server-side from the Stripe webhook, see api/stripe/webhook/route.ts)
 * marks the moment, but the authoritative rate is:
 *
 *   count(subscriptions.status = 'canceled') / count(subscriptions ever 'active')
 *
 * computed straight from Postgres. Use the PostHog event to segment *why*
 * (days since signup, tools used before canceling via RETENTION_EVENTS),
 * not to compute the rate itself.
 */
export const CHURN_EVENT: AnalyticsEventName = AnalyticsEvent.SubscriptionCanceled;
