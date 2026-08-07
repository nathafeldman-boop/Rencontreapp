import { PostHog } from "posthog-node";

import { clientEnv, serverEnv } from "@/lib/env";
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
 * Server-side event capture — used where there's no browser context,
 * e.g. the Stripe webhook firing `subscription_purchased`.
 */
export function trackServer<E extends AnalyticsEventName>(
  distinctId: string,
  event: E,
  properties: AnalyticsEventProps[E]
) {
  getClient()?.capture({ distinctId, event, properties });
}
