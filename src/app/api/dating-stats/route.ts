import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { datingStatsSchema } from "@/lib/validations/dating-stats";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

/** Returns every manually-entered stats row for the current user, newest first — the client filters by period locally. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const { data, error } = await supabase
    .from("dating_stats")
    .select("id, platform, period_start, period_end, likes, matches, conversations, replies, dates, created_at")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false });

  if (error) {
    console.error("[api/dating-stats GET] fetch failed", error);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ stats: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const json = await request.json().catch(() => null);
  const parsed = datingStatsSchema.safeParse(json);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { error } = await supabase.from("dating_stats").insert({ user_id: user.id, ...parsed.data });

  if (error) {
    console.error("[api/dating-stats POST] insert failed", error);
    return apiError("Une erreur est survenue — réessaie.", 500);
  }

  return apiSuccess({ saved: true }, 201);
}
