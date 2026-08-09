"use client";

import posthog from "posthog-js";

import type { AnalyticsEventName, AnalyticsEventProps } from "@/lib/analytics/events";

/**
 * Type-safe client-side event capture. Usage:
 *   track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "hero" })
 *
 * Also mirrors the event to our own `activity_events` table (fire-and-
 * forget, `keepalive` so it survives an immediate navigation) via
 * /api/analytics/activity — that route only persists, it never re-captures
 * into PostHog, so this can't double-count anything in a funnel. It's what
 * lets /admin/user/[id] show onboarding/tool-usage activity that otherwise
 * only ever reached PostHog.
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEventProps[E]
) {
  posthog.capture(event, properties);

  fetch("/api/analytics/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
    keepalive: true,
  }).catch(() => {
    // Best-effort telemetry — never let a failed mirror call surface to the user.
  });
}
