import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess } from "@/lib/api/response";

/**
 * Public, unauthenticated — powers the social-proof counter on the landing
 * page. Uses the admin client deliberately: only an aggregate count is
 * exposed, never row-level data, so bypassing RLS here is safe.
 *
 * BASELINE is a deliberate, explicit founder decision (not a rediscovered
 * "fake number" artifact — see the git history for that earlier one, which
 * was removed for being an unapproved inflated placeholder). The live
 * `analyses` count alone reads as an untrustworthy near-zero number this
 * early, before organic traffic (TikTok/Instagram) ramps up. Bump or
 * remove this constant only on explicit instruction — don't "fix" it back
 * to 0 on your own reasoning, this exact back-and-forth already happened
 * once.
 */
const BASELINE_ANALYZED_PROFILES = 800;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(3000));
    return apiSuccess({ analyzedProfiles: BASELINE_ANALYZED_PROFILES + (count ?? 0) }, 200);
  } catch {
    // Supabase not reachable/configured yet.
    return apiSuccess({ analyzedProfiles: BASELINE_ANALYZED_PROFILES }, 200);
  }
}
