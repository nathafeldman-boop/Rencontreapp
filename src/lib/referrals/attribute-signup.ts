import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { REWARD_THRESHOLDS } from "@/lib/referrals/rewards";
import { REFERRAL_COOKIE, CREATOR_COOKIE } from "@/lib/referrals/cookies";
import { AFFILIATE_COOKIE } from "@/lib/affiliates/cookies";
import { sendReferralRewardEmail } from "@/lib/email/send";
import type { Database } from "@/types/database.types";

export { REFERRAL_COOKIE, CREATOR_COOKIE };

interface AttributionResult {
  referralCode?: string;
  creatorSlug?: string;
  affiliateCode?: string;
}

/**
 * Called once, from `auth/callback`, right after a brand-new session is
 * established. Reads the `mai_aff` / `mai_ref` / `mai_creator` cookies set
 * by `/aff/[code]`, `/r/[code]`, or `/creator/[slug]`, records the
 * attribution, and grants referrer rewards if a threshold was just crossed.
 * Affiliate attribution is checked first — it's the one that pays out real
 * commission, so it takes priority if a visitor somehow carries more than
 * one attribution cookie.
 *
 * Uses the admin client deliberately: this is a trusted server-only flow
 * driven entirely by the verified new session, not by client input, so the
 * normal `authenticated`-role RLS restrictions on `referrals` (owner-only
 * read) would otherwise block resolving someone else's referral code.
 */
export async function attributeReferralSignup(
  request: NextRequest,
  userId: string
): Promise<AttributionResult | null> {
  const affiliateCode = request.cookies.get(AFFILIATE_COOKIE)?.value;
  const referralCode = request.cookies.get(REFERRAL_COOKIE)?.value;
  const creatorSlug = request.cookies.get(CREATOR_COOKIE)?.value;

  if (!affiliateCode && !referralCode && !creatorSlug) return null;

  const supabase = createAdminClient();

  if (affiliateCode) {
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("code", affiliateCode)
      .eq("active", true)
      .maybeSingle();

    if (!affiliate) return null;

    const { error } = await supabase
      .from("affiliate_referrals")
      .insert({ affiliate_id: affiliate.id, referred_user_id: userId });

    if (error) return null; // already attributed (unique violation) or other failure

    return { affiliateCode };
  }

  if (referralCode) {
    const { data: referral } = await supabase
      .from("referrals")
      .select("user_id")
      .eq("code", referralCode)
      .maybeSingle();

    if (!referral || referral.user_id === userId) return null;

    const { error } = await supabase
      .from("referral_invites")
      .insert({ referrer_user_id: referral.user_id, referred_user_id: userId, source: "referral" });

    if (error) return null; // already attributed (unique violation) or other failure

    await grantReferralRewardsIfEarned(supabase, referral.user_id);
    trackServer(userId, AnalyticsEvent.ReferralSignup, { referral_code: referralCode });
    return { referralCode };
  }

  if (creatorSlug) {
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("slug", creatorSlug)
      .eq("active", true)
      .maybeSingle();

    if (!creator) return null;

    const { error } = await supabase
      .from("referral_invites")
      .insert({ creator_id: creator.id, referred_user_id: userId, source: "creator" });

    if (error) return null;
    return { creatorSlug };
  }

  return null;
}

async function grantReferralRewardsIfEarned(supabase: SupabaseClient<Database>, referrerUserId: string) {
  const { count } = await supabase
    .from("referral_invites")
    .select("*", { count: "exact", head: true })
    .eq("referrer_user_id", referrerUserId);

  const threshold = REWARD_THRESHOLDS.find((t) => t.atInviteCount === count);
  if (!threshold) return;

  const expiresAt = new Date(Date.now() + threshold.days * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("referral_rewards")
    .upsert(
      { user_id: referrerUserId, reward_days: threshold.days, reason: threshold.reason, expires_at: expiresAt },
      { onConflict: "user_id,reason", ignoreDuplicates: true }
    );

  if (!error) {
    trackServer(referrerUserId, AnalyticsEvent.ReferralRewardGranted, {
      reward_days: threshold.days,
      invite_count: threshold.atInviteCount,
    });

    const { data: referrer } = await supabase.auth.admin.getUserById(referrerUserId);
    if (referrer.user?.email) {
      await sendReferralRewardEmail(referrer.user.email, threshold.days);
    }
  }
}
