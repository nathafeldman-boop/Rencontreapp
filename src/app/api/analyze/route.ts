import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/response";

/**
 * Placeholder only — the actual Mistral-powered scoring pipeline (photo
 * analysis, bio analysis, conversation-starter suggestions, and the
 * `analyses` row it produces) is built in a later step. This route exists
 * now so the client-side flow (/analyze -> POST here -> /results) can be
 * wired up against a stable contract ahead of time.
 *
 * TODO:
 *  1. Load the user's most recent `profiles` row.
 *  2. Call `callMistral` (see src/lib/ai/mistral.ts) with a scoring prompt.
 *  3. Insert the result into `analyses` and return its id.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  return apiError("Not implemented yet — AI analysis lands in a later step.", 501);
}
