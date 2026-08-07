"use client";

import posthog from "posthog-js";

import type { AnalyticsEventName, AnalyticsEventProps } from "@/lib/analytics/events";

/**
 * Type-safe client-side event capture. Usage:
 *   track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "hero" })
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEventProps[E]
) {
  posthog.capture(event, properties);
}
