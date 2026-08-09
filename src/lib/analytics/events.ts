/**
 * Canonical funnel events, TikTok -> paid subscriber -> retained user.
 * Keeping this as a single typed source of truth prevents typos from
 * silently breaking conversion reporting in PostHog.
 *
 * Grouped to match `lib/analytics/funnels.ts`, which is the reference used
 * to build the PostHog funnel insights described in the README (landing ->
 * signup, signup -> analysis, analysis -> payment, subscription churn).
 */
export const AnalyticsEvent = {
  // ---- Acquisition ---------------------------------------------------------
  LandingView: "landing_view",
  ClickStartAnalysis: "click_start_analysis",
  DeeplinkView: "deeplink_view",
  DeeplinkCtaClicked: "deeplink_cta_clicked",
  SignupStarted: "signup_started",
  SignupCompleted: "signup_completed",
  LoggedIn: "logged_in",

  // ---- Activation ------------------------------------------------------------
  OnboardingStarted: "onboarding_started",
  OnboardingCompleted: "onboarding_completed",
  ProfileUploadStarted: "profile_upload_started",
  ProfileUploadCompleted: "profile_upload_completed",
  AnalysisStarted: "analysis_started",
  AnalysisCompleted: "analysis_completed",

  // ---- Conversion ------------------------------------------------------------
  PaywallViewed: "paywall_viewed",
  CheckoutStarted: "checkout_started",
  SubscriptionCreated: "subscription_created",
  SubscriptionCanceled: "subscription_canceled",

  // ---- Retention ---------------------------------------------------------
  DashboardViewed: "dashboard_viewed",
  AnalysisRepeated: "analysis_repeated",
  AiCoachUsed: "ai_coach_used",
  BioGenerated: "bio_generated",
  BioApplied: "bio_applied",
  ConversationCoachUsed: "conversation_coach_used",
  PhotoOptimizerUsed: "photo_optimizer_used",
  DatingPlanGenerated: "dating_plan_generated",
  DatingStatsAdded: "dating_stats_added",

  // ---- Growth (referral & creator attribution) --------------------------
  ReferralLinkCopied: "referral_link_copied",
  ReferralSignup: "referral_signup",
  ReferralRewardGranted: "referral_reward_granted",
  ScoreShared: "score_shared",
  AffiliateLinkCopied: "affiliate_link_copied",

  // ---- Satisfaction --------------------------------------------------------
  FeedbackSubmitted: "feedback_submitted",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export interface AnalyticsEventProps {
  [AnalyticsEvent.LandingView]: { source?: string; variant: string };
  [AnalyticsEvent.ClickStartAnalysis]: { cta_location: string; variant?: string };
  [AnalyticsEvent.DeeplinkView]: { source: string };
  [AnalyticsEvent.DeeplinkCtaClicked]: { source: string; dest: string };
  [AnalyticsEvent.SignupStarted]: { method: "google" | "email" };
  [AnalyticsEvent.SignupCompleted]: {
    method: "google" | "email";
    referral_code?: string;
    creator_slug?: string;
    affiliate_code?: string;
  };
  [AnalyticsEvent.LoggedIn]: { method: "google" | "email" };

  [AnalyticsEvent.OnboardingStarted]: Record<string, never>;
  [AnalyticsEvent.OnboardingCompleted]: { steps_completed: number };
  [AnalyticsEvent.ProfileUploadStarted]: Record<string, never>;
  [AnalyticsEvent.ProfileUploadCompleted]: { photo_count: number };
  [AnalyticsEvent.AnalysisStarted]: Record<string, never>;
  [AnalyticsEvent.AnalysisCompleted]: { overall_score: number; is_simulated: boolean };

  [AnalyticsEvent.PaywallViewed]: { trigger: string };
  [AnalyticsEvent.CheckoutStarted]: { plan: "premium_monthly" | "premium_annual" };
  [AnalyticsEvent.SubscriptionCreated]: { plan: "premium_monthly" | "premium_annual" };
  [AnalyticsEvent.SubscriptionCanceled]: { plan: "premium_monthly" | "premium_annual" };

  [AnalyticsEvent.DashboardViewed]: { has_active_plan: boolean };
  [AnalyticsEvent.AnalysisRepeated]: { overall_score: number };
  [AnalyticsEvent.AiCoachUsed]: { conversation_score: number };
  [AnalyticsEvent.BioGenerated]: { style: string };
  [AnalyticsEvent.BioApplied]: { style: string };
  [AnalyticsEvent.ConversationCoachUsed]: Record<string, never>;
  [AnalyticsEvent.PhotoOptimizerUsed]: { photo_count: number };
  [AnalyticsEvent.DatingPlanGenerated]: Record<string, never>;
  [AnalyticsEvent.DatingStatsAdded]: { platform: string };

  [AnalyticsEvent.ReferralLinkCopied]: Record<string, never>;
  [AnalyticsEvent.ReferralSignup]: { referral_code: string };
  [AnalyticsEvent.ReferralRewardGranted]: { reward_days: number; invite_count: number };
  [AnalyticsEvent.ScoreShared]: { overall_score: number; method: "share_sheet" | "download" };
  [AnalyticsEvent.AffiliateLinkCopied]: Record<string, never>;

  [AnalyticsEvent.FeedbackSubmitted]: { category: "bug" | "feature" | "general"; helpful?: boolean };
}
