import { createClient } from "@/lib/supabase/server";
import { getOrCreateReferralCode } from "@/lib/referrals/get-or-create-code";
import { clientEnv } from "@/lib/env";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const code = await getOrCreateReferralCode(supabase, user.id);

  return apiSuccess({ code, url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/r/${code}` });
}
