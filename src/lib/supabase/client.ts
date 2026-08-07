import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { clientEnv } from "@/lib/env";

/**
 * Supabase client for use in Client Components ("use client").
 * Safe to call repeatedly — Supabase memoizes the underlying connection.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
