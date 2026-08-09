import { PostHog } from "posthog-node";

import { clientEnv, serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEventName, AnalyticsEventProps } from "@/lib/analytics/events";

let client: PostHog | null = null;

function getClient() {
  if (!serverEnv.POSTHOG_API_KEY) return null;
  if (!client) {
    client = new PostHog(serverEnv.POSTHOG_API_KEY, {
      host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

/**
 * Mirrors one event into `activity_events` (service-role write,
 * fire-and-forget, PostHog-independent) — the first-party copy that powers
 * the per-user activity history on /admin/user/[id]. `userId` must be a
 * real `public.users.id`. Exported separately from `trackServer` so
 * `/api/analytics/activity` can call it for client-originated events
 * without also re-capturing them server-side into PostHog (the browser
 * already sent those straight to PostHog via posthog-js — capturing again
 * here would double-count them in every funnel).
 */
export function persistActivityEvent<E extends AnalyticsEventName>(
  userId: string,
  event: E,
  properties: AnalyticsEventProps[E]
) {
  createAdminClient()
    .from("activity_events")
    .insert({ user_id: userId, event, properties: properties as Record<string, unknown> })
    .then(({ error }) => {
      if (error) console.error("[persistActivityEvent] Failed to persist activity_events row:", error);
    });
}

/**
 * Pre-signup sibling of persistActivityEvent — for events fired before
 * there's a `user_id` at all (landing view, click-to-start, signup
 * started), keyed on the `mai_anon` cookie instead. handle-new-signup.ts
 * claims these rows (stamps user_id, clears anon_id) the moment that
 * visitor actually creates an account, so the admin timeline shows the
 * landing page visit as the first event with no special-casing needed.
 */
export function persistAnonymousActivityEvent<E extends AnalyticsEventName>(
  anonId: string,
  event: E,
  properties: AnalyticsEventProps[E]
) {
  createAdminClient()
    .from("activity_events")
    .insert({ anon_id: anonId, event, properties: properties as Record<string, unknown> })
    .then(({ error }) => {
      if (error) console.error("[persistAnonymousActivityEvent] Failed to persist activity_events row:", error);
    });
}

/**
 * Server-side event capture — used where there's no browser context,
 * e.g. the Stripe webhook firing `subscription_purchased`. Also mirrors
 * the event into `activity_events` (see `persistActivityEvent`).
 */
export function trackServer<E extends AnalyticsEventName>(
  distinctId: string,
  event: E,
  properties: AnalyticsEventProps[E]
) {
  getClient()?.capture({ distinctId, event, properties });
  persistActivityEvent(distinctId, event, properties);
}
