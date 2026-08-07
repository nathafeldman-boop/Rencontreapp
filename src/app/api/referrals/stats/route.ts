import { createClient } from "@/lib/supabase/server";
import { REWARD_THRESHOLDS } from "@/lib/referrals/rewards";
import { getActiveBonusUntil } from "@/lib/referrals/compute-active-bonus";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const [{ count: inviteCount }, { data: rewards }] = await Promise.all([
    supabase.from("referral_invites").select("*", { count: "exact", head: true }).eq("referrer_user_id", user.id),
    supabase
      .from("referral_rewards")
      .select("reward_days, reason, granted_at, expires_at")
      .eq("user_id", user.id)
      .order("granted_at", { ascending: false }),
  ]);

  const activeBonusUntil = getActiveBonusUntil(rewards ?? []);
  const nextThreshold = REWARD_THRESHOLDS.find((t) => t.atInviteCount > (inviteCount ?? 0)) ?? null;

  return apiSuccess({
    inviteCount: inviteCount ?? 0,
    rewards: rewards ?? [],
    activeBonusUntil,
    nextThreshold,
  });
}
