import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/subscriptions/get-active-subscription";

/**
 * Gates the entire /dashboard subtree behind an active subscription.
 * `src/proxy.ts` already requires *authentication* here — this adds the
 * *payment* requirement, which is what makes the dashboard "premium".
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const supabase = await createClient();
  let subscription = await getActiveSubscription(supabase);

  if (!subscription) {
    // The Stripe webhook that activates a brand-new subscription can lag a
    // second or two behind the checkout redirect landing here — one short
    // retry avoids bouncing a just-paid user straight back to the paywall.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    subscription = await getActiveSubscription(supabase);
  }

  if (!subscription) {
    redirect("/paywall");
  }

  return <AppShell>{children}</AppShell>;
}
