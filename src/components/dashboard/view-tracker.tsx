"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics/track";
import type { AnalyticsEventName, AnalyticsEventProps } from "@/lib/analytics/events";

/**
 * Fires a single analytics event on mount. Used to bridge server-rendered
 * dashboard pages (which can't call posthog-js directly) into the client
 * analytics pipeline without turning the whole page into a Client Component.
 */
export function ViewTracker<E extends AnalyticsEventName>({
  event,
  properties,
}: {
  event: E;
  properties: AnalyticsEventProps[E];
}) {
  useEffect(() => {
    track(event, properties);
    // Fire once per mount — intentionally not re-running on prop identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
