import { createClient } from "@/lib/supabase/server";
import { getOrCreateReferralCode } from "@/lib/referrals/get-or-create-code";
import { REWARD_THRESHOLDS } from "@/lib/referrals/rewards";
import { getActiveBonusUntil } from "@/lib/referrals/compute-active-bonus";
import { clientEnv } from "@/lib/env";
import { ReferralsView } from "@/components/dashboard/referrals/referrals-view";

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-2 py-16 text-center">
        <p className="font-medium">Connecte-toi pour voir ton lien de parrainage.</p>
        <p className="text-sm text-muted-foreground">Cette page a besoin d&apos;un compte pour générer ton code.</p>
      </div>
    );
  }

  const [code, { count: inviteCount }, { data: rewards }] = await Promise.all([
    getOrCreateReferralCode(supabase, user.id),
    supabase.from("referral_invites").select("*", { count: "exact", head: true }).eq("referrer_user_id", user.id),
    supabase
      .from("referral_rewards")
      .select("reward_days, reason, granted_at, expires_at")
      .eq("user_id", user.id)
      .order("granted_at", { ascending: false }),
  ]);

  const activeBonusUntil = getActiveBonusUntil(rewards ?? []);
  const nextThreshold = REWARD_THRESHOLDS.find((t) => t.atInviteCount > (inviteCount ?? 0)) ?? null;

  return (
    <ReferralsView
      referralUrl={`${clientEnv.NEXT_PUBLIC_SITE_URL}/r/${code}`}
      inviteCount={inviteCount ?? 0}
      rewards={rewards ?? []}
      activeBonusUntil={activeBonusUntil}
      nextThreshold={nextThreshold}
    />
  );
}
