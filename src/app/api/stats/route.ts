import { createAdminClient } from "@/lib/supabase/admin";
import { apiSuccess } from "@/lib/api/response";

/**
 * Public, unauthenticated — powers the social-proof counter on the landing
 * page. Uses the admin client deliberately: only an aggregate count is
 * exposed, never row-level data, so bypassing RLS here is safe.
 *
 * Real count only — no baseline padding. This used to add a fake
 * "pre-launch" offset (12,847) so the counter never looked small; now that
 * the app has real users and a real number to be honest about, showing an
 * inflated count would just be false advertising.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(3000));
    return apiSuccess({ analyzedProfiles: count ?? 0 }, 200);
  } catch {
    // Supabase not reachable/configured yet.
    return apiSuccess({ analyzedProfiles: 0 }, 200);
  }
}
