import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { clientEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env";

/**
 * Privileged Supabase client using the service role key. Bypasses Row
 * Level Security — use ONLY in trusted server contexts (Stripe webhooks,
 * cron/background jobs). Never import this in a Client Component or
 * anything reachable from client-side code.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
