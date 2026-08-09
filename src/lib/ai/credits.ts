import type { SupabaseClient } from "@supabase/supabase-js";

import type { AiFeature, Database } from "@/types/database.types";

/** Credits consumed per call — vision + long-context calls cost more. */
export const FEATURE_COST: Record<AiFeature, number> = {
  profile_analysis: 5,
  bio_generator: 2,
  conversation_coach: 1,
  match_simulator: 3,
  dating_plan: 3,
  dating_stats: 1,
};

/** Monthly allowance for any active premium plan. Free users never reach this — the dashboard is gated before it. */
const MONTHLY_ALLOWANCE = 200;

export interface CreditCheckResult {
  allowed: boolean;
  used: number;
  remaining: number;
  allowance: number;
}

function startOfCurrentMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * Checks whether the caller has enough monthly AI credits left for
 * `feature`, without consuming any. Use before doing expensive work (e.g.
 * generating signed photo URLs) so a user who's out of credits fails fast.
 */
export async function checkCredits(
  supabase: SupabaseClient<Database>,
  feature: AiFeature
): Promise<CreditCheckResult> {
  const { data } = await supabase
    .from("ai_usage_events")
    .select("credits_used")
    .gte("created_at", startOfCurrentMonthIso());

  const used = (data ?? []).reduce((sum, row) => sum + row.credits_used, 0);
  const cost = FEATURE_COST[feature];

  return {
    allowed: used + cost <= MONTHLY_ALLOWANCE,
    used,
    remaining: Math.max(0, MONTHLY_ALLOWANCE - used),
    allowance: MONTHLY_ALLOWANCE,
  };
}

/** Records a successful AI call. Call only after the Mistral call actually succeeds. */
export async function consumeCredits(
  supabase: SupabaseClient<Database>,
  userId: string,
  feature: AiFeature
) {
  await supabase.from("ai_usage_events").insert({
    user_id: userId,
    feature,
    credits_used: FEATURE_COST[feature],
  });
}
