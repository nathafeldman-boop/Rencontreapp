import type { SupabaseClient } from "@supabase/supabase-js";

import { getStripeClient } from "@/lib/stripe/client";
import type { Database } from "@/types/database.types";
import type { ActivityEvent } from "@/lib/admin/activity-display";

export type { ActivityEvent, ActivitySession } from "@/lib/admin/activity-display";
export { labelForEvent, groupIntoSessions, classifyOrigin } from "@/lib/admin/activity-display";

/** Fetches every tracked event for a user, most recent first. Server-only (admin/service-role client). */
export async function getActivityEvents(
  admin: SupabaseClient<Database>,
  userId: string
): Promise<ActivityEvent[]> {
  const { data } = await admin
    .from("activity_events")
    .select("event, properties, occurred_at")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false });

  return (data ?? []).map((row) => ({
    event: row.event,
    properties: row.properties,
    occurredAt: row.occurred_at,
  }));
}

export interface LtvResult {
  totalCents: number;
  hasStripeCustomer: boolean;
  stripeCents: number;
  manualCents: number;
}

/**
 * Real LTV from paid Stripe invoices (when the account has a genuine `cus_`
 * customer) plus any manually-recorded payments — covers cash/off-platform
 * payments and the manually-granted premium accounts (see
 * stripe_customer_id = 'manual_owner_grant' / 'manual_affiliate_grant')
 * that have no Stripe invoice at all.
 */
export async function computeLtv(
  admin: SupabaseClient<Database>,
  userId: string,
  stripeCustomerId: string | null | undefined
): Promise<LtvResult> {
  const hasStripeCustomer = !!stripeCustomerId?.startsWith("cus_");
  let stripeCents = 0;

  if (hasStripeCustomer) {
    try {
      const invoices = await getStripeClient().invoices.list({
        customer: stripeCustomerId!,
        status: "paid",
        limit: 100,
      });
      stripeCents = invoices.data.reduce((sum, invoice) => sum + (invoice.amount_paid ?? 0), 0);
    } catch (err) {
      console.error("[computeLtv] Failed to fetch Stripe invoices:", err);
    }
  }

  const { data: manualPayments } = await admin
    .from("manual_payments")
    .select("amount_cents")
    .eq("user_id", userId);

  const manualCents = (manualPayments ?? []).reduce((sum, p) => sum + p.amount_cents, 0);

  return { totalCents: stripeCents + manualCents, hasStripeCustomer, stripeCents, manualCents };
}
