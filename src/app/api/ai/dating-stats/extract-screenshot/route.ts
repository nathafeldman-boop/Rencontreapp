import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { extractMatchListStats } from "@/lib/ai/dating-stats-vision";
import { checkCredits, consumeCredits } from "@/lib/ai/credits";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

export const maxDuration = 60;

const bodySchema = z.object({
  image: z.string().startsWith("data:image/"),
});

/**
 * Reads a matches/conversations/likes screenshot to prefill the weekly
 * stats form on /dashboard/progression — the user still reviews and can
 * edit every field before saving, nothing here is written to
 * `dating_stats` directly.
 */
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

  const credits = await checkCredits(supabase, "dating_stats");
  if (!credits.allowed) {
    return apiError("Tu as utilisé tous tes crédits coaching pour ce mois-ci.", 429);
  }

  const estimate = await extractMatchListStats(parsed.data.image);
  await consumeCredits(supabase, user.id, "dating_stats");

  return apiSuccess({ estimate });
}
