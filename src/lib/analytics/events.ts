/**
 * Canonical funnel events, TikTok -> paid subscriber. Keeping this as a
 * single typed source of truth prevents typos from silently breaking
 * conversion reporting in PostHog.
 */
export const AnalyticsEvent = {
  LandingPageViewed: "landing_page_viewed",
  CtaClicked: "cta_clicked",
  SignupCompleted: "signup_completed",
  OnboardingCompleted: "onboarding_completed",
  PhotosUploaded: "photos_uploaded",
  AnalysisCompleted: "analysis_completed",
  PaywallViewed: "paywall_viewed",
  SubscriptionPurchased: "subscription_purchased",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export interface AnalyticsEventProps {
  [AnalyticsEvent.LandingPageViewed]: { source?: string };
  [AnalyticsEvent.CtaClicked]: { cta_location: string };
  [AnalyticsEvent.SignupCompleted]: { method: "google" | "email" };
  [AnalyticsEvent.OnboardingCompleted]: { steps_completed: number };
  [AnalyticsEvent.PhotosUploaded]: { photo_count: number };
  [AnalyticsEvent.AnalysisCompleted]: { overall_score: number };
  [AnalyticsEvent.PaywallViewed]: { trigger: string };
  [AnalyticsEvent.SubscriptionPurchased]: { plan: "premium_monthly" | "premium_annual" };
}
