import { randomUUID } from "node:crypto";

import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { persistActivityEvent, persistAnonymousActivityEvent } from "@/lib/analytics/server";
import { AnalyticsEvent, type AnalyticsEventName } from "@/lib/analytics/events";
import { ANON_ID_COOKIE } from "@/lib/analytics/cookies";
import { apiSuccess, apiValidationError } from "@/lib/api/response";

const activitySchema = z.object({
  event: z.enum(Object.values(AnalyticsEvent) as [AnalyticsEventName, ...AnalyticsEventName[]]),
  properties: z.record(z.string(), z.unknown()).default({}),
});

const ANON_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days — long enough to cover any realistic signup delay

/**
 * Mirror-only sibling of /api/analytics/track: called by the client-side
 * `track()` wrapper (lib/analytics/track.ts) right after it captures an
 * event straight to PostHog via posthog-js. This route does NOT also
 * capture into PostHog — only into `activity_events` — so a client event
 * never gets double-counted in funnels (once from the browser, once from
 * here). It exists purely to give /admin/user/[id] a first-party record of
 * client-originated events (onboarding steps, tool usage, etc.), which
 * previously only ever reached PostHog.
 *
 * Events fired before signup (landing view, click-to-start) have no
 * `user_id` yet — persisted instead under an anonymous `mai_anon` cookie id
 * (see lib/analytics/cookies.ts), so the admin funnel can still start at
 * the landing page. handle-new-signup.ts claims these rows the moment that
 * visitor actually signs up.
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

  if (user) {
    persistActivityEvent(user.id, parsed.data.event, parsed.data.properties as never);
    return apiSuccess({ tracked: true });
  }

  const existingAnonId = request.cookies.get(ANON_ID_COOKIE)?.value;
  const anonId = existingAnonId || randomUUID();
  persistAnonymousActivityEvent(anonId, parsed.data.event, parsed.data.properties as never);

  const response = apiSuccess({ tracked: true });
  if (!existingAnonId) {
    response.cookies.set(ANON_ID_COOKIE, anonId, {
      maxAge: ANON_ID_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return response;
}
