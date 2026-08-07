import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Server-only. Pass an already-scoped Supabase client (see
 * lib/supabase/server.ts) — relies on RLS to only ever see the caller's
 * own row, so there's no need to pass/verify a user id separately.
 */
export async function getActiveSubscription(supabase: SupabaseClient<Database>) {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, stripe_customer_id")
    .maybeSingle();

  if (!data || !data.status || !ACTIVE_STATUSES.has(data.status)) {
    return null;
  }

  return data;
}
