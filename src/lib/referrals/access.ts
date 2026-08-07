import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Referral rewards grant temporary dashboard access without ever touching
 * Stripe/`subscriptions` — this just checks whether any unexpired reward
 * exists. Combine with `getActiveSubscription` (dashboard/layout.tsx does)
 * so either a real subscription OR referral credit unlocks the dashboard.
 */
export async function hasReferralBonusAccess(supabase: SupabaseClient<Database>): Promise<boolean> {
  const { data } = await supabase
    .from("referral_rewards")
    .select("expires_at")
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  return !!data;
}
