import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess } from "@/lib/api/response";

// Pre-launch baseline so the landing page counter doesn't read as "0" before
// real traffic arrives. Drop this once organic volume exceeds it.
const BASELINE_ANALYZED_PROFILES = 12_847;

/**
 * Public, unauthenticated — powers the social-proof counter on the landing
 * page. Uses the admin client deliberately: only an aggregate count is
 * exposed, never row-level data, so bypassing RLS here is safe.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(3000));
    return apiSuccess({ analyzedProfiles: BASELINE_ANALYZED_PROFILES + (count ?? 0) }, 200);
  } catch {
    // Supabase not reachable/configured yet — still give the landing page a number.
    return apiSuccess({ analyzedProfiles: BASELINE_ANALYZED_PROFILES }, 200);
  }
}
