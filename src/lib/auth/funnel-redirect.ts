import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";
import { hasReferralBonusAccess } from "@/lib/referrals/access";

/**
 * Where an already-authenticated visitor belongs right now, based on how
 * far they got last time. Used to stop returning users from being dumped
 * back at signup or onboarding and re-creating their profile/answers —
 * `/api/onboarding` and `/api/profile` both `insert` rather than `upsert`,
 * so replaying those forms produces duplicate rows.
 */
export async function getFunnelRedirect(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) return "/onboarding";

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!analysis) return "/analyze";

  const subscription = await getActiveSubscription(supabase);
  if (subscription) return "/dashboard";

  if (await hasReferralBonusAccess(supabase)) return "/dashboard";

  return "/paywall";
}
