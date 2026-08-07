import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent, type AnalyticsEventName } from "@/lib/analytics/events";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const trackSchema = z.object({
  event: z.enum(Object.values(AnalyticsEvent) as [AnalyticsEventName, ...AnalyticsEventName[]]),
  properties: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Server-side escape hatch for funnel events that don't originate in the
 * browser (e.g. triggered from another Route Handler after a DB write).
 * Client-side events should call `track()` from lib/analytics/track.ts
 * directly instead of round-tripping through this endpoint.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(json);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  trackServer(user.id, parsed.data.event, parsed.data.properties as never);

  return apiSuccess({ tracked: true });
}
