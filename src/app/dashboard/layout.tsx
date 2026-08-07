import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";
import { hasReferralBonusAccess } from "@/lib/referrals/access";

/**
 * Gates the entire /dashboard subtree behind an active subscription OR an
 * unexpired referral reward (see lib/referrals/access.ts — inviting friends
 * grants temporary premium access without ever touching Stripe).
 * `src/proxy.ts` already requires *authentication* here — this adds the
 * *payment-or-earned-access* requirement, which is what makes the dashboard
 * "premium". Note `/referrals` itself lives outside this layout (see
 * app/referrals/page.tsx) precisely so a free user can get their invite
 * link before they've earned anything.
 *
 * Temporarily off (alongside AUTH_GATE_ENABLED in lib/supabase/proxy.ts) so
 * the owner can review the dashboard pre-launch without a real subscription.
 * Flip back to `true` before going live.
 */
const PREMIUM_GATE_ENABLED = false;

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const supabase = await createClient();

  if (PREMIUM_GATE_ENABLED) {
    let subscription = await getActiveSubscription(supabase);

    if (!subscription) {
      // The Stripe webhook that activates a brand-new subscription can lag a
      // second or two behind the checkout redirect landing here — one short
      // retry avoids bouncing a just-paid user straight back to the paywall.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      subscription = await getActiveSubscription(supabase);
    }

    if (!subscription && !(await hasReferralBonusAccess(supabase))) {
      redirect("/paywall");
    }
  }

  return <AppShell>{children}</AppShell>;
}
