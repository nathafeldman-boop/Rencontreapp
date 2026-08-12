import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";

const bodySchema = z.object({
  category: z.enum(["bug", "feature", "general"]),
  context: z.string().max(100).optional(),
  helpful: z.boolean().optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    category: parsed.data.category,
    context: parsed.data.context ?? null,
    helpful: parsed.data.helpful ?? null,
    message: parsed.data.message ?? null,
  });

  if (error) {
    console.error("[api/feedback] insert failed", error);
    return apiError("Impossible d'enregistrer ton avis — réessaie.", 500);
  }

  trackServer(user.id, AnalyticsEvent.FeedbackSubmitted, {
    category: parsed.data.category,
    helpful: parsed.data.helpful,
  });

  return apiSuccess({ saved: true });
}
