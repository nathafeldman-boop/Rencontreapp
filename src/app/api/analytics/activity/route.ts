import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { persistActivityEvent } from "@/lib/analytics/server";
import { AnalyticsEvent, type AnalyticsEventName } from "@/lib/analytics/events";
import { apiSuccess, apiValidationError } from "@/lib/api/response";

const activitySchema = z.object({
  event: z.enum(Object.values(AnalyticsEvent) as [AnalyticsEventName, ...AnalyticsEventName[]]),
  properties: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Mirror-only sibling of /api/analytics/track: called by the client-side
 * `track()` wrapper (lib/analytics/track.ts) right after it captures an
 * event straight to PostHog via posthog-js. This route does NOT also
 * capture into PostHog — only into `activity_events` — so a client event
 * never gets double-counted in funnels (once from the browser, once from
 * here). It exists purely to give /admin/user/[id] a first-party record of
 * client-originated events (onboarding steps, tool usage, etc.), which
 * previously only ever reached PostHog.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = activitySchema.safeParse(json);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not every tracked event has a signed-in user yet (landing page views,
  // "signup started"). Silently no-op instead of 401ing — this is
  // best-effort telemetry, not something the caller should ever branch on.
  if (!user) {
    return apiSuccess({ tracked: false });
  }

  persistActivityEvent(user.id, parsed.data.event, parsed.data.properties as never);

  return apiSuccess({ tracked: true });
}
